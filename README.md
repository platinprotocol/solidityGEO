# Solidity GEO

Solidity GEO is a library that enables operation with geospatial objects in Solidity. Its design principles and patterns are based on the highly reliable and popular PostGIS. Solidity GEO's main focus is effectively expressing geospatial primitives on chain and enabling operations with a minimal amount of gas required.<br/>  

Solidity GEO currently has  **polygons** and **circles** implemented.<br/>

In the same way as PostGIS, a **polygon** contains an array of rings.<br/>
Each ring is represented as an array of points. The first point of each ring is always the same to last point.<br/>
Each point contains two numbers: the first number is latitude, the second number is longitude.<br/>
Underlying data structure for a polygon is an int32 array, so the max allowed value for latitude is 90000000 and for longitude is 180000000, assuming each lon/lat to be multiplied by 10^6 to make int32 value with acceptable precision. <br/>
Example: In order store geoPoint(79.123, -110.000287) you have transform coordinates like this: (79123000, -110000287).<br/>

A **circle** is another geo primitive implemented in Solidity GEO. It contains the latitude and longitude of the center point and the radius.<br/>
Latitude and longitude are encoded in the same way as a polygon.<br/>

#### Quickstart

- Choose which polygon contract you need LightPolygon.sol or HeavyPolygon.sol. (LightPolygon is cheaper in terms of gas consumption, please use this one if you have 1 ring with fewer than 19 points, otherwise use HeavyPolygon)

- On deployment, a set of data defining Polygon needs to be provided. Example:
[2, 6, 3, 3, 177200246, 110441952, 25242204, 39802040, 15242224, -39802040, 65000000, 20000000, -51000000, 25000000, -164000000, -4000000]

- Data format:
    - Zero cell contains the amount of rings in a polygon. (In our example: date[0] == 2)
    - The first cell contains the total amount of points in the polygon. (In our example: date[1] == 6)
    - Next, N cells contain the number of points in each of the rings, where N is the amount of rings (specified in the Zero cell). (date[2]... date[2 + date[0]])
    - Other cells contain points of all rings in the order of the rings.
        - (first rings points: [177200246, 110441952, 25242204, 39802040, 15242224, -39802040])
        - (second rings points: [65000000, 20000000, -51000000, 25000000, -164000000, -4000000])
- Important constraints:
    - Max rings amount in a polygon is 255.
    - Min points amount per ring is 3, max points amount depends on gas the limit.
    - The sum of the points in the rings should be equal to the total number of points in the polygon.

#### Polygon functions

```solidity
 makeImmutable() public
```
Make this contract immutable. After this functions will be executed
you will not be able to modify any values in this contract anymore.
```solidity
 addPoints(int32[] memory points, uint8 ringIndex) public
```
Add points to the ring specified by the index (index starts from 0).<br/>
Requirements: ring to exist and have some points.<br/>
*points* array of points.<br/>
*ringIndex* index of the ring points will be added to.
```solidity
 addPoints(int32[] memory points, uint8 ringIndex, uint32 pointNum) public
```
Insert points to the ring specified by the index (index starts from 0).<br/>
Requirements: ring to exist and have some points.<br/>
*points* array of points.<br/>
*ringIndex* index of the ring in which points will be added.<br/>
*pointNum* is the number of existing points in the ring, specified points will be inserted after.
```solidity
 removePoints(uint32 amount, uint8 ringIndex, uint32 offset) public
```
Remove points from the ring specified by the index (index starts from 0).<br/>
Requirements: ring to exist and have points<br/>
*amount* amount of points to delete (not cells in the underlying int32 array, each point is 2 numbers in the array).<br/>
*ringIndex* index of the ring points will be removed from<br/>
*offset* index of point *amount* of points will be removed after<br/>

```solidity
 addRing(int32[] memory points) public
```
Create a new ring with points specified.
*points* array of points (1 point = 2 numbers in array).
```solidity
 addRing(int32[] memory points, uint8 index) public
 ```
Create a new ring and insert it after the ring specified by the index.<br/>
Requirements: index to specify valid ring.<br/>
*points*  array of points.<br/>
*index* index of the ring a new ring will be inserted after.
```solidity
 removeRing(uint8 ringIndex) public
```
Remove the ring and all its points<br/>
*ringIndex* index of ring.
```solidity
 changeContractOwner(address _to) public returns (bool)
```
Change contract owner to another address. (Only contract owner can add Oracle addresses and make the contract immutable, only the contract owner can call this function) <br/>
The function returns true if the contract owner was changed successfully.
```solidity
addOracledAddress(address _oracled) public returns (bool)
```
Add Oracle address. (Only the contract owner and Oracles are able to change the contract state if the contract is still mutable, only the contract owner can call this function).<br/>
Function returns true if the Oracle address was added successfully.<br/>
```solidity
 deleteOracledAddress(address _oracled) public returns (bool)
```
Delete Oracle address. (Only the contract owner can call this function)<br/>
Function returns true if the Oracle address was deleted successfully.<br/>

```solidity
getPointsByRing(uint8 ringIndex) public view returns (int32[] memory)
```
Get ring points by the ring index.<br/>
*ringIndex* index of the ring.<br/>
```solidity
 getPoints() public view returns (int32[] memory)
```
Get points of the first ring (ring with index = 0)
```solidity
 getPointsAmountByRing(uint8 ringIndex) public view returns(uint32)
```
Get points amount by the ring index<br/>
*ringIndex* index of the ring.<br/>
```solidity
 getPointsAmount() public view returns(uint32)
```
Get the total points amount (amount of all of the points in all of the rings).
```solidity
 getRingsAmount()
```
Get the rings amount in a polygon.
```solidity
 isImmutable() public view returns (bool)
```
If the function returned true, then the polygon is immutable (no one will be able to change its state).

#### Circle functions
```solidity
 getData() public view returns(int32[])
```
Returns an array of circle data. The first 2 items in the array are coordinates of the center point, the 3rd item is the radius. <br>

## License

The Solidity GEO library is licensed under the
[MIT License](https://opensource.org/licenses/MIT), also included in our repository in the `LICENSE` file.
