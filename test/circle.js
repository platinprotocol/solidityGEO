require('../tools/ArrayComparator.js');
var Circle = artifacts.require("./Circle.sol");

contract('Circle', function (accounts) {

    it("Should init circle contract correct", async function () {
        let data = generateConstructorParam();
        let contract;
        return deploy(data).then(function (instance) {
            contract = instance;

            return contract.getData();
        }).then(function (contractData) {
            assert(data.equals(contractData), "Data in contract not correct.");

            return contract.latitude();
        }).then(function (latitude) {
            assert(data[0] == latitude, "Latitude in contract not correct.");

            return contract.longitude();
        }).then(function (longitude) {
            assert(data[1] == longitude, "Longitude in contract not correct.");

            return contract.radius();
        }).then(function (radius) {
            assert(data[2] == radius, "Radius in contract not correct.");
        });
    });

    it ("Shouldn't init invalid data", async function() {
        let isTxFail = false;
        try {
            let data = generatePoint();
            let radius = -1;
            data.push(radius);

            await Circle.new(data);
        } catch(err) {
            isTxFail = true;
        } finally {
            assert(isTxFail, "Contract accept invalid radius.");
        }

        try {
            let radius = generateRadius();
            let data = [-90000001, 180000000, radius];

            await Circle.new(data);
            isTxFail = false;
        } catch(err) {
            isTxFail = true;
        } finally {
            assert(isTxFail, "Contract accept invalid latitude.");
        }

        try {
            let radius = generateRadius();
            let data = [-90000000, 180000001, radius];
            await Circle.new(data);
            isTxFail = false;
        } catch(err) {
            isTxFail = true;
        } finally {
            assert(isTxFail, "Contract accept invalid longitude.");
        }

        try {
            let data = [1, 1, 1, 1];
            await Circle.new(data);
            isTxFail = false;
        } catch(err) {
            isTxFail = true;
        } finally {
            assert(isTxFail, "Contract accept an incorrect number of parameters.");
        }

        try {
            let data = [1, 1];
            await Circle.new(data);
            isTxFail = false;
        } catch(err) {
            isTxFail = true;
        } finally {
            assert(isTxFail, "Contract accept an incorrect number of parameters.");
        }
    });

});

async function deploy(data){
    return Circle.new(data);
}

function generateConstructorParam() {
    let point = generatePoint();
    let radius = generateRadius();
    point.push(radius);

    return point;
}

function generatePoint() {
    let point = new Array();
    let latitude = Math.floor(Math.random() * 89000000);
    let longitude = Math.floor(Math.random() * 179000000);

    if (isNegative())
        latitude *= -1;
    if (isNegative())
        longitude *= -1;

    point.push(latitude, longitude);

    return point;
}

function generateRadius() {
    return Math.floor(Math.random() * 19000000) + 1;
}

function isNegative() {
    return Math.floor(Math.random() * 10) % 2 == 0;
}

