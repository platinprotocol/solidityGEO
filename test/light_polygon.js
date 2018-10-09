require('../tools/ArrayComparator.js');
const utils = require('ethereumjs-util');
var LightPolygon = artifacts.require("./LightPolygon.sol");
var generatePoints = require("./tools/pointsGenerater.js");
const { EVMRevert } = require('./tools/EVMRevert');

require('chai')
    .use(require('chai-as-promised'))
    .should();

contract('LightPolygon', function (accounts) {
    const initPolygon = [2, 8, 4, 4, 177200246, 110441952, 25242204, 39802040, 15242224, -39802040, 12242224, -19802040, 65000000, 20000000, -51000000, 25000000, -164000000, -4000000, -164000000, -4000000];
    // const cellsPerPoint = 2;
    const initFirstRing = [177200246, 110441952, 25242204, 39802040, 15242224, -39802040, 12242224, -19802040];
    const initSecondRing = [65000000, 20000000, -51000000, 25000000, -164000000, -4000000, -164000000, -4000000];
    const initRingsAmount = 2;
    const initTotalPointsAmount = 8;
    var contract;

    beforeEach(async function () {
        contract = await LightPolygon.new(initPolygon);
    });

    it("Check init data", function () {
        return contract.getPointsByRing.call(0).then(function (firstRingPoints) {
            assert(firstRingPoints.equals(initFirstRing), "First rings points is not equals with initialization array.");

            return contract.getPointsByRing.call(1)
        }).then(function(secondRingPoints) {
            assert(secondRingPoints.equals(initSecondRing), "Second rings points is not equals with initialization array.");

            return contract.isImmutable.call();
        }).then(function(isImmutable) {
            assert(isImmutable === false, "State must be not immutable.");

            return contract.getPointsAmount.call();
        }).then(function(pointsAmount) {
            assert.equal(initTotalPointsAmount, pointsAmount.valueOf(), "Total points amount is not correct.");

            return contract.getPoints.call();
        }).then(function(firstRingPoints) {
            assert(firstRingPoints.equals(initFirstRing), "Default ring points is not equals with initialization array.");

            return contract.getRingsAmount.call();
        }).then(function(ringsAmount) {
            assert.equal(initRingsAmount, ringsAmount.valueOf(), "Rings amount is not equals with initialization rings amount.");
        });
    });

    it("Add new Ring and remove initialized one", function () {
        let thirdRing = [25, 22, -151, 25, -74, -88, 82, 21];
        return contract.addRing(thirdRing).then(function (txHash) {

            return contract.getPointsByRing(2);
        }).then(function(ring) {
            assert(thirdRing.equals(ring), "Third rings points is not equals with pushed ring.");

            return contract.getPointsAmount.call();
        }).then(function(pointsAmount) {
            let expectedPointsAmount = initTotalPointsAmount + thirdRing.length / 2;
            assert.equal(expectedPointsAmount, pointsAmount.valueOf(), "Total points amount is not correct after adding third ring.");

            return contract.getPointsAmountByRing.call(2);
        }).then(function(amount) {
            let expectedPointsAmount = thirdRing.length / 2;
            assert.equal(expectedPointsAmount, amount.valueOf(), "Total points amount of third ring is not correct.");

            return contract.getRingsAmount.call();
        }).then(function(ringsAmount) {
            let expectedRingsAmount = 3;
            assert.equal(expectedRingsAmount, ringsAmount.valueOf(), "Rings amount is not equals with initialization rings amount.");

            return contract.removeRing(1);
        }).then(function(tr) {
            return contract.getRingsAmount.call();
        }).then(function(ringsAmount) {
            let expectedRingsAmount = 2;
            assert.equal(expectedRingsAmount, ringsAmount.valueOf(), "Rings amount is not equals with expected.");

            return contract.getPointsByRing.call(0);
        }).then(function(firstRing) {
            assert(firstRing.equals(initFirstRing), "First rings points is not correct.");

            return contract.getPointsByRing.call(1);
        }).then(function(thirdRingPoints) {
            assert(thirdRing.equals(thirdRingPoints), "Third rings points is not correct.");

            return contract.getPointsAmount.call();
        }).then(function(amount) {
            let expectedPointsAmount = initFirstRing.length / 2 + thirdRing.length / 2;
            assert.equal(expectedPointsAmount, amount.valueOf(), "Points amount is not equals with expected.");

            return contract.getPointsAmountByRing.call(0);
        }).then(function(pointsAmount) {
            let expectedPointsAmount = initFirstRing.length / 2;
            assert.equal(expectedPointsAmount, pointsAmount, "First rings points amount is not correct.");

            return contract.getPointsAmountByRing.call(1);
        }).then(function(pointsAmount) {
            let expectedPointsAmount = thirdRing.length / 2;
            assert.equal(expectedPointsAmount, pointsAmount, "Third rings points amount is not correct.");
        });
    });

    it ("Remove points from ring", function() {
        let amount = 1;
        let ringIndex = 0;
        let offset = 1;
        let expectedFirstRing = [177200246, 110441952, 15242224, -39802040, 12242224, -19802040];
        //const initFirstRing = [177200246, 110441952, 25242204, 39802040, 15242224, -39802040, 12242224, -19802040];
        return contract.removePoints(amount, ringIndex, offset).then(function(tr) {
            return contract.getPoints.call();
        }).then(function(firstRingPoints) {
            assert(expectedFirstRing.equals(firstRingPoints), "First rings points is not correct.");

            return contract.getPointsAmount.call();
        }).then(function(amount) {
            let expectedAmount = expectedFirstRing.length / 2 + initSecondRing.length / 2;
            assert.equal(expectedAmount, amount.valueOf(), "Total points amount is not correct.");

            return contract.getPointsAmountByRing.call(ringIndex);
        }).then(function(amount) {
            let expectedAmount = expectedFirstRing.length / 2;
            assert.equal(expectedAmount, amount.valueOf(), "First rings points amount is not correct.");

            return contract.getPointsAmountByRing.call(1);
        }).then(function(amount) {
            let expectedAmount = initSecondRing.length / 2;
            assert.equal(expectedAmount, amount.valueOf(), "Second rings points amount is not correct.");

            return contract.getRingsAmount.call();
        }).then(function(amount) {
            let expectedAmount = 2;
            assert.equal(expectedAmount, amount.valueOf(), "Rings amount is not correct");
        });
    });

    it ("Add points from specific index to ring", function() {
        let insertedPoints = [117200246, -110441952, -98242233, 41822041];
        let ringIndex = 1;
        let offset = 1;
        let expectedSecondRing = [65000000, 20000000, 117200246, -110441952, -98242233, 41822041, -51000000, 25000000, -164000000, -4000000, -164000000, -4000000];

        return contract.addPoints(insertedPoints, ringIndex, offset).then(function() {
            return contract.getPointsByRing(ringIndex);
        }).then(function(secondR) {
            assert(expectedSecondRing.equals(secondR), "Second rings points is not correct.");

            return contract.getPointsAmount.call();
        }).then(function(amount) {
            let expectedAmount = initTotalPointsAmount + insertedPoints.length / 2;
            assert.equal(expectedAmount, amount.valueOf(), "Points amount is not correct.");

            return contract.getPointsAmountByRing.call(ringIndex);
        }).then(function(amount) {
            let expectedAmount = expectedSecondRing.length / 2;
            assert.equal(expectedAmount, amount.valueOf(), "Points amount of second ring is not correct.");

            return contract.getPointsAmountByRing.call(0);
        }).then(function(amount) {
            let expectedAmount = initFirstRing.length / 2;
            assert.equal(expectedAmount, amount.valueOf(), "Points amount of first ring is not correct.");

            return amount;
        });
    });

    it("Add new Rings at specific index", function () {
        let newSecondRing = [25, 22, -151, 25, -74, -88, 82, 21];
        let newThridRing = [-25, -22, 151, -25, 74, -88, 82, 21];
        return contract.addRing(newSecondRing, 1).then(function() {
            return contract.getPointsByRing.call(1);
        }).then(function(secondRing) {
            assert(newSecondRing.equals(secondRing), "Second rings points are not correct");

            return contract.addRing(newThridRing, 2)
        }).then(function(tr) {
            return contract.getPointsByRing.call(2);
        }).then(function(thirdRing) {
            assert(newThridRing.equals(thirdRing), "Third rings points are not correct");

            return contract.getPointsByRing.call(0);
        }).then(function(firstRing) {
            assert(initFirstRing.equals(firstRing), "First rings points are not correct");

            return contract.getPointsByRing.call(3);
        }).then(function(fourthRing) {
            assert(initSecondRing.equals(fourthRing), "Fourth rings points are not correct");

            return contract.getPointsAmount.call();
        }).then(function(amount) {
            let expectedAmount = initFirstRing.length / 2 + initSecondRing.length / 2 + newSecondRing.length / 2 + newThridRing.length / 2;
            assert.equal(expectedAmount, amount.valueOf(), "Total points amount is not correct");

            return contract.getRingsAmount.call();
        }).then(function(amount) {
            assert.equal(4, amount.valueOf(), "Rings amount is not correct");

            return contract.getPointsAmountByRing.call(0);
        }).then(function(amount) {
            let expectedAmount = initFirstRing.length / 2;
            assert.equal(expectedAmount, amount.valueOf(), "First rings points amount is not correct.");

            return contract.getPointsAmountByRing.call(1);
        }).then(function(amount) {
            let expectedAmount = newSecondRing.length / 2;
            assert.equal(expectedAmount, amount.valueOf(), "Second rings points amount is not correct.");

            return contract.getPointsAmountByRing.call(2);
        }).then(function(amount) {
            let expectedAmount = newThridRing.length / 2;
            assert.equal(expectedAmount, amount.valueOf(), "Third rings points amount is not correct.");

            return contract.getPointsAmountByRing.call(3);
        }).then(function(amount) {
            let expectedAmount = initSecondRing.length / 2;
            assert.equal(expectedAmount, amount.valueOf(), "Fourth rings points amount is not correct.");
        });
    });

    it("Should not be able to add points to ring with out of index", async function() {
        let newPoints = generatePoints(10);
        let ringIndex = 3;
        await  contract.addPoints(newPoints, ringIndex).should.be.rejectedWith(EVMRevert);
        await  contract.addPoints(newPoints, ringIndex, 1).should.be.rejectedWith(EVMRevert);
    });

    it("Should not be able to remove points from ring with out of index", async function() {
        let ringIndex = 3;
        await  contract.removePoints(1, ringIndex, 1).should.be.rejectedWith(EVMRevert);
    });

    it("Should not be able to remove ring with out of index", async function() {
        let ringIndex = 3;
        await  contract.removeRing(ringIndex).should.be.rejectedWith(EVMRevert);
    });

    it("Should not be able to add points array with not even length", async function () {
        let newPoints = generatePoints(10);
        newPoints.push(900000);
        let ringIndex = 1;

        await  contract.addPoints(newPoints, ringIndex).should.be.rejectedWith(EVMRevert);
        await  contract.addPoints(newPoints, ringIndex, 1).should.be.rejectedWith(EVMRevert);

        newPoints = [90000000];
        await  contract.addPoints(newPoints, ringIndex, 1).should.be.rejectedWith(EVMRevert);
    });


    it("Cannot be less than 3 points in the polygon", async function() {
        let amount = 2;
        let ringIndex = 0;
        let offset = 1;
        await contract.removePoints(amount, ringIndex, offset).should.be.rejectedWith(EVMRevert);
    });

    it ("Should add points to exist ring by it index", async function () {
        let newPoints = generatePoints(10);
        let ringIndex = 1;
        await  contract.addPoints(newPoints, ringIndex).should.be.fulfilled;

        let expectedPoints = initSecondRing.concat(newPoints);
        let points = await contract.getPointsByRing(ringIndex);

        assert(expectedPoints.equals(points), "Second ring points is not correct.");
    });

    it("Should not be able to add ring with less then 3 points", async function() {
        let newPoints = generatePoints(2);
        let ringIndex = 1;

        await  contract.addRing(newPoints).should.be.rejectedWith(EVMRevert);
        await  contract.addRing(newPoints, ringIndex).should.be.rejectedWith(EVMRevert);
    });

    it("Should not be able to add Ring with not even cell length of points array", async function () {
        let newPoints = generatePoints(10);
        newPoints.push(900000);
        let ringIndex = 1;

        await  contract.addRing(newPoints).should.be.rejectedWith(EVMRevert);
        await  contract.addRing(newPoints, ringIndex).should.be.rejectedWith(EVMRevert);
    });

    it("Should not be able to insert ring in to not exist ring", async function () {
        let newPoints = generatePoints(10);
        let ringIndex = 3;

        await  contract.addRing(newPoints, ringIndex).should.be.rejectedWith(EVMRevert);
    });

    it("Should not be able to get points amount by not exist ring index", async function() {
        let ringIndex = 3;
       await contract.getPointsAmountByRing(ringIndex).should.be.rejectedWith(EVMRevert);
    });

    it("Only oracles address should be able to change polygon state", async function() {
        var account2 = accounts[1];

        let newSecondRing = [25, 22, -151, 25, -74, -88, 82, 21];

        let promice = await contract.addRing(newSecondRing, 1, {from: account2}).should.be.rejectedWith(EVMRevert);

        return contract.addOracledAddress(account2).then(function() {
            return contract.addRing(newSecondRing, 1, {from: account2});
        }).then(function(tr) {
            return contract.getPointsByRing.call(1);
        }).then(function(secondRing) {
            assert(newSecondRing.equals(secondRing), "Second rings points are not correct");

            return contract.deleteOracledAddress(account2);
        }).then(async function() {
            await contract.addRing(newSecondRing, 1, {from: account2}).should.be.rejectedWith(EVMRevert);
        });

    });

    it("Should not be able to change polygon state after mutable flag is turn up", async function () {
        await contract.makeImmutable().should.be.fulfilled;
        let isImmutable = await contract.isImmutable();
        assert(isImmutable, "Contract is not immutable.");

        let newPoints = generatePoints(5);

        await contract.addRing(newPoints).should.be.rejectedWith(EVMRevert);
        await contract.addRing(newPoints, 1).should.be.rejectedWith(EVMRevert);
        await contract.addPoints(newPoints, 1).should.be.rejectedWith(EVMRevert);
        await contract.addPoints(newPoints, 1, 1).should.be.rejectedWith(EVMRevert);
        await contract.removePoints(1, 1, 1).should.be.rejectedWith(EVMRevert);
        await contract.removeRing(1).should.be.rejectedWith(EVMRevert);
    });

    it("Should be able to change contract owner", async function() {
        await contract.changeContractOwner(accounts[1]).should.be.fulfilled;
        let newPoints = generatePoints(5);

        await contract.changeContractOwner(accounts[0]).should.be.rejectedWith(EVMRevert);
        await contract.changeContractOwner(accounts[0], {from: accounts[1]}).should.be.fulfilled;
    });

    it("Should not be able to create polygon with 2 points", async function () {
        let polygonData = [1, 2, 2];
        let newPoints = generatePoints(2);
        polygonData = polygonData.concat(newPoints);
        await LightPolygon.new(polygonData).should.be.rejectedWith(EVMRevert);
    });

    it("Should not be able to create polygon with 2 points in one of rings", async function () {
        let polygonData = [2, 6, 4, 2];
        let newPoints = generatePoints(6);
        polygonData = polygonData.concat(newPoints);
        await LightPolygon.new(polygonData).should.be.rejectedWith(EVMRevert);
    });

    it("Should not be able to create polygon with wrong identificator of points amount", async function() {
        let polygonData = [2, 5, 3, 3];
        let newPoints = generatePoints(6);
        polygonData = polygonData.concat(newPoints);
        await LightPolygon.new(polygonData).should.be.rejectedWith(EVMRevert);
    });

    it("Should not be able to create polygon with wrong identificator of points amount in ring", async function() {
        let polygonData = [2, 7, 3, 4];
        let newPoints = generatePoints(6);
        polygonData = polygonData.concat(newPoints);
        await LightPolygon.new(polygonData).should.be.rejectedWith(EVMRevert);

        polygonData = [2, 7, 3, 3];
        newPoints = generatePoints(6);
        polygonData = polygonData.concat(newPoints);
        await LightPolygon.new(polygonData).should.be.rejectedWith(EVMRevert);
    });

    it("Should not be able to create polygon with not eval points cells", async function() {
        let polygonData = [2, 7, 3, 4];
        let newPoints = generatePoints(7);
        newPoints.push(90000000);
        polygonData = polygonData.concat(newPoints);
        await LightPolygon.new(polygonData).should.be.rejectedWith(EVMRevert);
    });

    it("Should not be able to create polygon with more then max rings amount", async function() {
        let polygonData = [256, 7, 3, 4];
        let newPoints = generatePoints(7);
        polygonData = polygonData.concat(newPoints);
        await LightPolygon.new(polygonData).should.be.rejectedWith(EVMRevert);
    });

    it("Should not be able to create polygon without ring", async function() {
        let polygonData = [0, 7, 3, 4];
        let newPoints = generatePoints(7);
        polygonData = polygonData.concat(newPoints);
        await LightPolygon.new(polygonData).should.be.rejectedWith(EVMRevert);
    });

    it("Should not be able to create polygon without incorrect points amount", async function() {
        let polygonData = [2, 8, 4, 4];
        let newPoints = generatePoints(9);
        polygonData = polygonData.concat(newPoints);
        await LightPolygon.new(polygonData).should.be.rejectedWith(EVMRevert);
    });
});

