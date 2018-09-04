require('../tools/ArrayComparator.js');
const utils = require('ethereumjs-util');
var LightPolygon = artifacts.require("./LightPolygon.sol");

contract('Polygon', function (accounts) {
    const ringAmount = 1;
    const initPointsAmount = 3;
    var initPoints = generatePoints(initPointsAmount);
    var polygon = [ringAmount, initPointsAmount, initPointsAmount];
    for (let i = 0; i < initPoints.length; i++) {
        polygon.push(initPoints[i]);
    }

    beforeEach(async function () {
        contract = await LightPolygon.new(polygon);
        let receipt = await web3.eth.getTransactionReceipt(contract.transactionHash);
        console.log("Gas used to deploy contract with " + initPointsAmount + " points: " + receipt.gasUsed + " transaction hash: " + receipt.transactionHash + " address: " + receipt.contractAddress);
    });

    it("Count gas pricePolygon.sol", function () {
        var newPoints = generatePoints(100);
        return contract.addPoints(newPoints, 0).then(function(tr) {
            console.log("Gas used to add 100 points: " + tr.receipt.gasUsed);
            let _points = generatePoints(100);

            return contract.addPoints(_points, 0);
        }).then(function(tr) {
            console.log("Gas used to add 100 points: " + tr.receipt.gasUsed);
            let _points = generatePoints(100);

            return contract.addPoints(_points, 0);
        }).then(function(tr) {
            console.log("Gas used to add 100 points: " + tr.receipt.gasUsed);
            let _points = generatePoints(100);

            return contract.addPoints(_points, 0);
        }).then(function(tr) {
            console.log("Gas used to add 100 points: " + tr.receipt.gasUsed);
            let _points = generatePoints(100);

            return contract.addPoints(_points, 0);
        }).then(function(tr) {
            console.log("Gas used to add 100 points: " + tr.receipt.gasUsed);
            let _points = generatePoints(100);

            return contract.addPoints(_points, 0);
        }).then(function(tr) {
            console.log("Gas used to add 100 points: " + tr.receipt.gasUsed);
            let _points = generatePoints(100);

            return contract.addPoints(_points, 0);
        }).then(function(tr) {
            console.log("Gas used to add 100 points: " + tr.receipt.gasUsed);
            let _points = generatePoints(100);

            return contract.addPoints(_points, 0);
        });
    });

});

function generatePoints(pointsAmount) {
    let size = pointsAmount * 2;
    let points = new Array();
    for (let i = 0; i < size; i++) {
        let val = Math.floor(Math.random() * 179000000) + 1000000;
        points.push(val);
    }

    return points;
}

