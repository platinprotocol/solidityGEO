require('../tools/ArrayComparator.js');
const utils = require('ethereumjs-util');
var HeavyPolygon = artifacts.require("./HeavyPolygon.sol");

contract('HeavyPolygon', function (accounts) {
    const initPolygon = [2, 8, 4, 4, 177200246, 110441952, 25242204, 39802040, 15242224, -39802040, 12242224, -19802040, 65000000, 20000000, -51000000, 25000000, -164000000, -4000000, -164000000, -4000000];
    // const cellsPerPoint = 2;
    const initFirstRing = [177200246, 110441952, 25242204, 39802040, 15242224, -39802040, 12242224, -19802040];
    const initSecondRing = [65000000, 20000000, -51000000, 25000000, -164000000, -4000000, -164000000, -4000000];
    const initRingsAmount = 2;
    const initTotalPointsAmount = 8;
    var contract;

    beforeEach(async function () {
        contract = await HeavyPolygon.new(initPolygon);
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

    it("Security", async function() {
        var account2 = accounts[1];

        let newSecondRing = [25, 22, -151, 25, -74, -88, 82, 21];

        try {
            let promice = await contract.addRing(newSecondRing, 1, {from: account2});
            assert(false, "Not oracle user change ring.");
        } catch(err) {}

        return contract.addOracledAddress(account2).then(function() {
            return contract.addRing(newSecondRing, 1, {from: account2});
        }).then(function(tr) {
            return contract.getPointsByRing.call(1);
        }).then(function(secondRing) {
            assert(newSecondRing.equals(secondRing), "Second rings points are not correct");

            return contract.deleteOracledAddress(account2);
        }).then(async function() {
            try {
                let promice = await contract.addRing(newSecondRing, 1, {from: account2});
                assert(false, "Not oracle user change ring.");
            } catch(err) {}
        });

    });

});

