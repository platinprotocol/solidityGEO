pragma solidity ^0.4.24;


contract MultipleOracled {
    mapping(address => address) internal oracleAddresses;
    address public contractOwner;

    constructor() public {
        contractOwner = msg.sender;
        oracleAddresses[msg.sender] = msg.sender;
    }

    modifier onlyContractOwner() {
        require(contractOwner == msg.sender);
        _;
    }

    modifier onlyOracle() {
        require(oracleAddresses[msg.sender] != 0x0);
        _;
    }

    function changeContractOwner(address _to) public onlyContractOwner returns (bool) {
        oracleAddresses[_to] = _to;
        contractOwner = _to;
        return true;
    }

    function addOracledAddress(address _oracled) public onlyContractOwner returns (bool) {
        oracleAddresses[_oracled] = _oracled;
        return true;
    }

    function deleteOracledAddress(address _oracled) public onlyContractOwner returns (bool) {
        delete oracleAddresses[_oracled];
        return true;
    }

}
