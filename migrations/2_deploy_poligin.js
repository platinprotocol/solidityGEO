var LightPolygon = artifacts.require("./LightPolygon.sol");
var HeavyPolygon = artifacts.require("./HeavyPolygon.sol");
var ConvertLib = artifacts.require("./libs/ConvertLib.sol");

//First index is rings amount, second index is total points amount, third point in ring points amount
var polygonData = [2, 6, 3, 3, 30, 20, -11, 15, -123, -44, 65, 20, -51, 25, -244, -4];
module.exports = function(deployer) {
    deployer.deploy(LightPolygon, polygonData);
    deployer.deploy(ConvertLib);
    deployer.link(ConvertLib, HeavyPolygon);
    deployer.deploy(HeavyPolygon, polygonData);

};
