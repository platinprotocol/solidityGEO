============
Solidity GEO
============

| Solidity GEO implements GIS polygon core functions.
| A polygon contains an array of rings.
| Each ring is represented as an array of points. The first point of each ring is always the same as the last point. 
| Each point contain from two cells first cell is latitude, second cell is longitude.
| The polygon consists of int32 array. Where max allowed value for latitude is 90000000 and for longitude is 180000000.
| Solidity support only integers so 180000000 will represent 180.000000.a
| So if you what to store geoPoint(79.123, -110.000287) you have send it like(79123000, -110000287).


Quickstart
----------

| - Choose which polygon contract we need LightPolygon.sol or HeavyPolygon.sol. (Light cheaper by gas consumption if it consists of less than 19 points otherwise use Heavy)
|
| - You have to submit to constructor of the contract predefined polygon data. Example: 
| [2, 6, 3, 3, 177200246, 110441952, 25242204, 39802040, 15242224, -39802040, 65000000, 20000000, -51000000, 25000000, -164000000, -4000000]
|
| - Data format:
|
| Zero cell contain amount of rings in polygon. (In our example: date[0] == 2)
|
| First cell contain the total amount of points in the polygon. (In our example: date[1] == 6)
|
| Next N cells contains amount of points in each rings, where N this rings amount. (date[2]... date[2 + date[0]])
|
| All other cells contains points of all rings in order of the rings. 
| (In our example first rings points: [177200246, 110441952, 25242204, 39802040, 15242224, -39802040])
| (In our example second rings points: [65000000, 20000000, -51000000, 25000000, -164000000, -4000000])
|
| Constrains:
| Max rings amount in polygon is 255.
| Min points amount per ring is 3, max points amount depend on gas limit.
| The sum of the points in the rings should be equal to the total number of points in the polygon.

Polygon functions
-----------------

- makeImmutable() public

| Make this contract immutable. After this functions will be executed
| you will not be able to modify any values in this contract.
| 

- addPoints(int32[] memory points, uint8 ringIndex) public

| Add points to ring specific by index(Index started from 0).
| Constrain: ring must exist, and already contain points.
| 'points' param is  array of points.
| 'ringIndex' param is Index of ring in which points will be added.
| 

- addPoints(int32[] memory points, uint8 ringIndex, uint32 pointNum) public

| Add points to ring specific by index(Index started from 0).
| Constrain: ring must exist, and already contain points.
| 'points' param is array of points.
| 'ringIndex' param is index of ring in which points will be added.
| 'pointNum' is the number of points(not cells, each point is two cell) from which new will be added.
| 

- removePoints(uint32 amount, uint8 ringIndex, uint32 offset) public

| Remove points from ring specific by index(Index started from 0).
| Constrain: ring must exist, and contain enough cells to do offset * 2 + amount * 2.
| Remember that each point is two cells.
| 'amount' param is amount of points to delete(not cells, each point is two cell).
| 'ringIndex' param is index of ring from which points will be removed.
| 'offset' param is the number of points(not cells, each point is two cell) from which amount of points will be deleted
| 

- addRing(int32[] memory points) public

| Create new ring and add points in it.
| 'points' param is array of points.
| 

- addRing(int32[] memory points, uint8 index) public

| Create new ring and add points in it.
| Constrain: rings amount must be enough to do offset. 
| Remember that each point is two cells.
| 'points' param is array of points.
| 'index' param is the number of cells in rings array in which new ring will be added.
| 

- removeRing(uint8 ringIndex) public

| Remove ring and all its points by ring index(Index started from 0).
| 'ringIndex' param is index of ring.
| 

- changeContractOwner(address _to) public returns (bool)

| Change contract owner to onther address.(Only contract owner can add oracle addresses and make contract immutable, only contract owner can call this function)
| Function returns true if contract owner was changed successful.
| 

- addOracledAddress(address _oracled) public returns (bool)

| Add oracle address. (Only contract owner and oracles are able to change contract state if contract is still mutable, only contract owner can call this function).
| Function returns true if oracle address was added successful.
| 

- deleteOracledAddress(address _oracled) public returns (bool)

| Delete oracle address. (Only contract owner can call this function)
| Function returns true if oracle address was deleted successful.
| 

- getPointsByRing(uint8 ringIndex) public view returns (int32[] memory)

| Get ring points by ring index.
| 'ringIndex' is index of ring.
| 

- getPoints() public view returns (int32[] memory)

| Get points of first ring(ring index 0)
| 

- getPointsAmountByRing(uint8 ringIndex) public view returns(uint32)

| Get points amount by index ring(Index started from 0).
| ringIndex param is index of ring.
| 

- getPointsAmount() public view returns(uint32)

| Get total points amount(sum of points in all rings).
| 

- getRingsAmount() 

| Get rings amount in polygon
| 

- isImmutable() public view returns (bool)

| If function returned true then polygon is immutable (no one will be able to change its state).
| 

Circle functions
-----------------

- getData() public view returns(int32[])

| Generate data array with size of 3 elements.
| Zero cell contains latitude.
| First cell contains longitude.
| Second cell contains radius. 