var Circle = artifacts.require("./Circle.sol");

//First cell is latitude, second cell is longitude points amount, third point in ring points amount
var circleData = [3000000, -40000000, 2];
module.exports = function(deployer) {
    deployer.deploy(Circle, circleData);
};
