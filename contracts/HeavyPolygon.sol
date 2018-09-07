pragma solidity ^0.4.24;


import "./Polygon.sol";
import "./libs/ArrayMemory32Lib.sol";
import "./libs/ArrayStorageU32Lib.sol";
import "./libs/SafeMath32.sol";
import "./libs/ConvertLib.sol";
import "./MultipleOracled.sol";


/**
 * @author Misha Savchuk
 * @title Contract that implement GIS polygon core functions.
 * Notice then each point contain from two cells first cell is latitude, second cell is longitude.
 */
contract HeavyPolygon is Polygon, MultipleOracled {
    using ArrayMemory32Lib for int32[];
    using ArrayStorageU32Lib for uint32[];
    using SafeMath32 for uint32;
    using ConvertLib for int32[];
    using ConvertLib for bytes;

    //Tree which contain points per ring. Where key is ring index and value is array of points.
    mapping(uint8 => bytes) internal rings;

    /**
     * @notice Create smart contract with predefined polygon in it.
     * @notice Each point contain from two cells first cell is latitude, second cell is longitude.
     * @dev Data format:
     * Zero cell contain amount of rings in polygon.
     *          (date[0])
     * First cell contain the total amount of points in the polygon.
     *          (date[1])
     * Next N cells contains amount of points in each rings, where N this rings amount.
     *          (date[2]... date[2 + date[0]])
     * All other cells contains points of all rings in order of the rings.
     *          (date[2 + date[0]]... date.length)
     * @dev Constrains:
     * 1 <= date[0] <= 255
     *          (Min rings amount is 1. Max rings amount is 255)
     * 3 * date[0] <= date[1]
     *          (Min points amount per ring is 3. Max points amount depend on gas limit)
     * sum(date[2]... date[2 + date[0]]) == date[1]
     *          (The sum of the points in the rings
     *              should be equal to the total number of points in the polygon)
     * date.length - 2 - date[2 + date[0]] == date[1] * 2
     *          (The number of points in the polygons must correspond to reality)
     * @param data polygon predefined data.
     */
    constructor(int32[] data) public {
        require(data.length > MIN_DATA_SIZE);
        require(data[INDEX_OF_RINGS_AMOUNT] >= MIN_RINGS_AMOUNT);
        require(data[INDEX_OF_RINGS_AMOUNT] <= MAX_RINGS_AMOUNT);

        uint8 ringsAmount = uint8(data[INDEX_OF_RINGS_AMOUNT]);

        require(data[INDEX_OF_POINTS_AMOUNT] >= ringsAmount * MIN_POINTS_AMOUNT_PER_RING);
        pointsAmount = uint32(data[INDEX_OF_POINTS_AMOUNT]);

        uint32 pointsAmountChecker = 0;
        for (uint i = 0; i < ringsAmount; i++) {
            require(data[INDEX_OF_POINTS_AMOUNT_IN_FIRST_RING + i] >= MIN_POINTS_AMOUNT_PER_RING);
            uint32 currPointsAmount = uint32(data[INDEX_OF_POINTS_AMOUNT_IN_FIRST_RING + i]);
            pointsAmountChecker += currPointsAmount;
            ringsSizes.push(currPointsAmount);
        }

        require(pointsAmountChecker == pointsAmount);

        require(data.length - 2 - ringsAmount == pointsAmount * CELLS_PER_POINT);

        uint index = INDEX_OF_POINTS_AMOUNT_IN_FIRST_RING + ringsAmount;
        uint8 ringIndex = 0;
        for (uint j = 0; j < ringsSizes.length; j++) {
            uint32 currRingSize = ringsSizes[j];
            int32[] memory ringPoints = new int32[](currRingSize * CELLS_PER_POINT);
            uint lastIndex = index + currRingSize * CELLS_PER_POINT;
            uint k = 0;
            for (; index < lastIndex; index++) {
                ringPoints[k] = data[index];
                k++;
            }

            rings[ringIndex] = ringPoints.toBytes();
            ringIndex += 1;
        }
    }

    modifier onlyIfMutable() {
        require(!immutability);
            _;
    }

    function makeImmutable() public onlyContractOwner {
        immutability = true;
    }

    function addPoints(int32[] memory points, uint8 ringIndex) public onlyIfMutable onlyOracle {
        require(ringsSizes.length > ringIndex);
        require(points.length >= CELLS_PER_POINT && points.length % CELLS_PER_POINT == 0);

        rings[ringIndex].concatStorage(points.toBytes());
        //We store ring size in points, not in cells. So we have to divide cells amount per 2.
        increaseRingSizeOn(ringIndex, uint32(points.length / CELLS_PER_POINT));
    }

    function addPoints(int32[] memory points, uint8 ringIndex, uint32 pointNum)
        public
        onlyIfMutable
        onlyOracle
    {
        require(ringsSizes.length > ringIndex);
        require(points.length >= CELLS_PER_POINT && points.length % CELLS_PER_POINT == 0);
        //To get offset in cells we have to multiply offset in points per 2
        //and each int32 cell is 4 bytes.
        uint offset = pointNum.mul(CELLS_PER_POINT).mul(4);

        bytes storage currBytes = rings[ringIndex];
        bytes memory inPoints = points.toBytes();
        bytes memory headBytes = new bytes(currBytes.length - offset + inPoints.length);
        for (uint i = 0; i < inPoints.length; i++) {
            headBytes[i] = inPoints[i];
        }

        for (uint j = offset; j < currBytes.length; j++) {
            headBytes[i] = currBytes[j];
            i++;
        }
        currBytes.length = offset;
        currBytes.concatStorage(headBytes);

        //We store ring size in points, not in cells. So we have to divide cells amount per 2.
        increaseRingSizeOn(ringIndex, uint32(points.length / CELLS_PER_POINT));
    }

    function removePoints(uint32 amount, uint8 ringIndex, uint32 offset)
        public
        onlyIfMutable
        onlyOracle
    {
        //Min points amount per ring is 3
        require(ringsSizes[ringIndex] - MIN_POINTS_AMOUNT_PER_RING >= amount);
        require(ringsSizes.length > ringIndex);
        //To get offset in cells we have to multiply offset in points per 2.
        offset = offset.mul(CELLS_PER_POINT);
        //To get amount in cells we have to multiply amount in points per 2.
        amount = amount.mul(CELLS_PER_POINT);

        int32[] memory existPoints = rings[ringIndex].toInt();
        existPoints = existPoints.removeElements(amount, offset);
        rings[ringIndex] = existPoints.toBytes();

        //We store ring size in points, not in cells. So we have to divide cells amount per 2.
        reduceRingSizeOn(ringIndex, amount / CELLS_PER_POINT);
    }

    function addRing(int32[] memory points) public onlyIfMutable onlyOracle {
        //Minimum points in ring is 3. (minimum cells is 6).
        require(points.length >= CELLS_PER_POINT * MIN_POINTS_AMOUNT_PER_RING);
        require(points.length % CELLS_PER_POINT == 0);

        uint32 _pointsAmount = uint32(points.length / CELLS_PER_POINT);
        ringsSizes.push(_pointsAmount);
        pointsAmount = pointsAmount.add(_pointsAmount);

        rings[uint8(ringsSizes.length - 1)] = points.toBytes();
    }

    function addRing(int32[] memory points, uint8 index) public onlyIfMutable onlyOracle {
        require(ringsSizes.length > index);
        //Minimum points in ring is 3. (minimum cells is 6).
        require(points.length >= CELLS_PER_POINT * MIN_POINTS_AMOUNT_PER_RING);
        require(points.length % CELLS_PER_POINT == 0);

        uint32 _pointsAmount = uint32(points.length) / CELLS_PER_POINT;
        ringsSizes.addElement(_pointsAmount, index);
        pointsAmount = pointsAmount.add(_pointsAmount);

        for (uint8 i = uint8(ringsSizes.length - 1); i >= index; i--) {
            rings[i] = rings[i - 1];
        }

        rings[index] = points.toBytes();
    }

    function removeRing(uint8 ringIndex) public onlyIfMutable onlyOracle {
        require(ringsSizes.length > ringIndex && ringsSizes.length > 1);

        uint32 pointsDeleted = ringsSizes[ringIndex];
        pointsAmount = pointsAmount.sub(pointsDeleted);

        ringsSizes.removeElement(ringIndex);

        for (uint i = ringIndex; i < ringsSizes.length; i++) {
            rings[ringIndex] = rings[ringIndex + 1];
        }
    }

    function getPointsByRing(uint8 ringIndex) public view returns (int32[] memory) {
        return rings[ringIndex].toInt();
    }

    function getPoints() public view returns (int32[] memory) {
        return rings[0].toInt();
    }

    function isImmutable() public view returns (bool) {
        return immutability;
    }

    function getPointsAmountByRing(uint8 ringIndex) public view returns(uint32) {
        require(ringsSizes.length > ringIndex);

        return ringsSizes[ringIndex];
    }

    function getPointsAmount() public view returns(uint32) {
        return pointsAmount;
    }

    function getRingsAmount() public view returns (uint8) {
        return uint8(ringsSizes.length);
    }

    /**
    * @dev Increase ring size and total points quantity per specified value.
    * @param ringIndex Index of ring in which size will be increased.
    * @param val Value on which ring size will be increased.
    */
    function increaseRingSizeOn(uint8 ringIndex, uint32 val) internal {
        ringsSizes[ringIndex] = ringsSizes[ringIndex].add(val);
        pointsAmount = pointsAmount.add(val);
    }

    /**
    * @dev Reduce ring size and total points quantity per specified value.
    * @param ringIndex Index of ring in which size will be reduced.
    * @param val Value on which ring size will be reduced.
    */
    function reduceRingSizeOn(uint8 ringIndex, uint32 val) internal {
        require(ringsSizes[ringIndex] >= val);

        ringsSizes[ringIndex] = ringsSizes[ringIndex].sub(val);
        pointsAmount = pointsAmount.sub(val);
    }
}