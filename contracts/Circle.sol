pragma solidity ^0.4.24;


/**
 * @author Misha Savchuk
 * @title Contract that displays a circle on the map
 */
contract Circle {
    //Maximum latitude value
    int32 constant public MAX_LATITUDE = 90000000;
    //Minimum latitude value
    int32 constant public MIN_LATITUDE = -90000000;
    //Maximum longitude value
    int32 constant public MAX_LONGITUDE = 180000000;
    //Minimum longitude value
    int32 constant public MIN_LONGITUDE = -180000000;
    //Maximum allowed radius value in meters
    int32 constant public MAX_RADIUS = 20000000;
    //Minimum allowed radius value in meters
    int32 constant public MIN_RADIUS = 1;

    int32 public latitude;

    int32 public longitude;

    int32 public radius;

    constructor (int32[] data) public {
        require(data.length == 3);
        require(data[0] <= MAX_LATITUDE && data[0] >= MIN_LATITUDE);
        require(data[1] <= MAX_LONGITUDE && data[1] >= MIN_LONGITUDE);
        require(data[2] <= MAX_RADIUS && data[2] >= MIN_RADIUS);
        latitude = data[0];
        longitude = data[1];
        radius = data[2];
    }

    /**
     * @notice Generate data array with size of 3 elements.
     * Zero cell contains latitude
     * First cell contains longitude
     * Second cell contains radius
     * @return data
     */
    function getData() public view returns(int32[]){
        int32[] memory data = new int32[](3);
        data[0] = latitude;
        data[1] = longitude;
        data[2] = radius;

        return data;
    }

}