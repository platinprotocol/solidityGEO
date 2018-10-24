# Solidity GEO

Solidity GEO is a library that allows to operate with geo spatial objects in Solidity. Its inspired by PostGIS and it's design principles are derived from PostGIS as much as possible. Solidity GEO main focus is effectively storing geo primitives on chain and operating with them with minimum amount of gas required.<br/>  

Solidity GEO currently has  **polygon** and **circle** implemented<br/>

The same way to PostGIS, a **polygon** contains an array of rings.<br/>
Each ring is represented as an array of points. The first point of each ring is always the same to last point.<br/>
Each point contains two numbers: first number is latitude, second number is longitude.<br/>
Underlying data structure for polygon is an int32 array, so max allowed value for latitude is 90000000 and for longitude is 180000000, assuming that each lon/lat to be multiplied by 10^6 to make int32 value with acceptable precision. <br/>
Example: In order store geoPoint(79.123, -110.000287) you have transform coordinates like this: (79123000, -110000287).<br/>

A **circle** is another geo primitive implemented in Solidity GEO. It contains latitude, longitude of center point and radius.<br/>
Latitude and longitude are encoded the same way to polygon.<br/>

#### Quickstart

- Choose which polygon contract we need LightPolygon.sol or HeavyPolygon.sol. (LightPolygon is cheaper by gas consumption, please use this one if you have 1 ring with less then 19 points, otherwise use HeavyPolygon)

- On deployment, a set of data defining Polygon to be provided. Example:
[2, 6, 3, 3, 177200246, 110441952, 25242204, 39802040, 15242224, -39802040, 65000000, 20000000, -51000000, 25000000, -164000000, -4000000]

- Data format:
    - Zero cell contains amount of rings in polygon. (In our example: date[0] == 2)
    - First cell contains the total amount of points in the polygon. (In our example: date[1] == 6)
    - Next N cells contains amount of points in each rings, where N this amount of rings (specified in Zero cell). (date[2]... date[2 + date[0]])
    - other cells contains points of all rings in order of the rings.
        - (first rings points: [177200246, 110441952, 25242204, 39802040, 15242224, -39802040])
        - (second rings points: [65000000, 20000000, -51000000, 25000000, -164000000, -4000000])
- Important constrains:
    - Max rings amount in polygon is 255.
    - Min points amount per ring is 3, max points amount depend on gas limit.
    - The sum of the points in the rings should be equal to the total number of points in the polygon.

#### Polygon functions

```solidity
 makeImmutable() public
```
Make this contract immutable. After this functions will be executed<br/>
you will not be able to modify any values in this contract anymore.
```solidity
 addPoints(int32[] memory points, uint8 ringIndex) public
```
Add points to ring specified by index (index started from 0).<br/>
Requirements: ring to exist and have some points.<br/>
*points* array of points.<br/>
*ringIndex* index of the ring points will be added to.
```solidity
 addPoints(int32[] memory points, uint8 ringIndex, uint32 pointNum) public
```
insert points to the ring specified by index (index started from 0).<br/>
Requirements: ring to exist and have some points.<br/>
*points* array of points.<br/>
*ringIndex* index of ring in which points will be added.<br/>
*pointNum* is the number existing point in the ring specified points will be inserted after.
```solidity
 removePoints(uint32 amount, uint8 ringIndex, uint32 offset) public
```
Remove points from ring specified by index (index started from 0).<br/>
Requirements: ring to exist and have points<br/>
*amount* amount of points to delete (not cells in underlying int32 array, each point is two 2 numbers in array).<br/>
*ringIndex* index of ring points will be removed from<br/>
*offset* index of point *amount* of points will be removed after<br/>

```solidity
 addRing(int32[] memory points) public
```
Create new ring with points specified.
*points* array of points (1 point = 2 numbers in array).
```solidity
 addRing(int32[] memory points, uint8 index) public
 ```
Create new ring and insert it after the ring specified by index<br/>
Requirements: index to specify valid ring<br/>
*points*  array of points.<br/>
*index* index of the ring a new ring will be inserted after.
```solidity
 removeRing(uint8 ringIndex) public
```
Remove ring and all its points<br/>
*ringIndex* index of ring.
```solidity
 changeContractOwner(address _to) public returns (bool)
```
Change contract owner to another address. (Only contract owner can add oracle addresses and make contract immutable, only contract owner can call this function) <br/>
Function returns true if contract owner was changed successful.
```solidity
addOracledAddress(address _oracled) public returns (bool)
```
Add oracle address. (Only contract owner and oracles are able to change contract state if contract is still mutable, only contract owner can call this function).<br/>
Function returns true if oracle address was added successful.<br/>
```solidity
 deleteOracledAddress(address _oracled) public returns (bool)
```
Delete oracle address. (Only contract owner can call this function)<br/>
Function returns true if oracle address was deleted successful.<br/>

```solidity
getPointsByRing(uint8 ringIndex) public view returns (int32[] memory)
```
Get ring points by ring index.<br/>
*ringIndex* index of ring.<br/>
```solidity
 getPoints() public view returns (int32[] memory)
```
Get points of first ring (ring with index = 0)
```solidity
 getPointsAmountByRing(uint8 ringIndex) public view returns(uint32)
```
Get points amount by ring index<br/>
*ringIndex* index of ring.<br/>
```solidity
 getPointsAmount() public view returns(uint32)
```
Get total points amount (amount of all points in all rings).
```solidity
 getRingsAmount()
```
Get rings amount in polygon
```solidity
 isImmutable() public view returns (bool)
```
If function returned true then polygon is immutable (no one will be able to change its state).

#### Circle functions
```solidity
 getData() public view returns(int32[])
```
Returns array of circle data. First 2 items in array are coordinates of the center point, 3rd item is the radius. <br>

## License

The Solidity GEO library is licensed under the
[MIT License](https://opensource.org/licenses/MIT), also included in our repository in the `LICENSE` file.
