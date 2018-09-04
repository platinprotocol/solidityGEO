pragma solidity ^0.4.24;


/**
 * @author Misha Savchuk
 * @title Polygon is abstract contract of GIS polygon which describe core functions.
 */
contract Polygon {
    //The number of cells in the array occupied by a one point.
    uint8 constant public CELLS_PER_POINT = 2;
    //Minimum array length that allowed in predefined array.
    uint8 constant public MIN_DATA_SIZE = 8;
    //Index of cell in predefined array which contain amount of rings.
    uint8 constant public INDEX_OF_RINGS_AMOUNT = 0;
    //Minimum allowed rings amount.
    uint8 constant public MIN_RINGS_AMOUNT = 1;
    //Maximum allowed rings amount.
    uint8 constant public MAX_RINGS_AMOUNT = 255;
    //Index of cell in predefined array which contain amount of all points in polygon.
    uint8 constant public INDEX_OF_POINTS_AMOUNT = 1;
    //Minimum allowed points amount in one ring.
    uint8 constant public MIN_POINTS_AMOUNT_PER_RING = 3;
    //Index of cell in predefined array which contain points amount of first ring.
    uint8 constant public INDEX_OF_POINTS_AMOUNT_IN_FIRST_RING = 2;
    //It's a mark that mean that polygon is ready and immutable.
    bool public immutability;
    //Amount of points in all rings.
    uint32 public pointsAmount;
    //Array which contains amount of points per ring.
    uint32[] internal ringsSizes;

    /**
    * @notice Make this contract immutable.
    * After this functions will be executed
    * you will not be able to modify any values in this contract.
    */
    function makeImmutable() public;

    /**
    * @notice Add points to ring specific by index(Index started from 0).
    * Constrain: ring must exist, and already contain points.
    * @param points Array of points.
    * @param ringIndex Index of ring in which points will be added.
    */
    function addPoints(int32[] memory points, uint8 ringIndex) public;

    /**
    * @notice Add points to ring specific by index(Index started from 0).
    * Constrain: ring must exist, and already contain points.
    * @param points Array of points.
    * @param ringIndex Index of ring in which points will be added.
    * @param pointNum The number of points(not cells, each point is two cell)
    * from which new will be added.
    */
    function addPoints(int32[] memory points, uint8 ringIndex, uint32 pointNum) public;

    /**
    * @notice Remove points from ring specific by index(Index started from 0).
    * Constrain: ring must exist, and contain enough cells to do offset * 2 + amount * 2.
    * Remember that each point is two cells.
    * @param amount Amount of points to delete(not cells, each point is two cell).
    * @param ringIndex Index of ring from which points will be removed.
    * @param offset The number of points(not cells, each point is two cell)
    *        from which amount of points will be deleted
    */
    function removePoints(uint32 amount, uint8 ringIndex, uint32 offset) public;

    /**
    * @notice Create new ring and add points in it.
    * @param points Array of points.
    */
    function addRing(int32[] memory points) public;

    /**
    * @notice Create new ring and add points in it.
    * Constrain: rings amount must be enough to do offset.
    * Remember that each point is two cells.
    * @param points Array of points.
    * @param index The number of cells in rings array in which new ring will be added.
    */
    function addRing(int32[] memory points, uint8 index) public;

    /**
    * @notice Remove ring and all its points by ring index(Index started from 0).
    * @param ringIndex Index of ring.
    */
    function removeRing(uint8 ringIndex) public;

    /**
    * @notice Get ring points by ring index.
    * @param ringIndex Index of ring.
    * @return ring points
    */
    function getPointsByRing(uint8 ringIndex) public view returns (int32[] memory);

    /**
    * @notice Get points of first ring(ring index 0)
    */
    function getPoints() public view returns (int32[] memory);

    /**
    * @notice Get points amount by index ring(Index started from 0).
    * @param ringIndex Index of ring.
    */
    function getPointsAmountByRing(uint8 ringIndex) public view returns(uint32);

    /**
    * @notice Get total points amount(sum of points in all rings).
    */
    function getPointsAmount() public view returns(uint32);

    /**
    * @notice If function returned true
    * then polygon is immutable (no one will be able to change its state).
    * @return polygon immutability
    */
    function isImmutable() public view returns (bool);

    /**
    * @return rings amount
    */
    function getRingsAmount() public view returns (uint8);

}