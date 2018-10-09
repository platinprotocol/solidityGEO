module.exports = {
    // port: 6545,
    // compileCommand: '../node_modules/.bin/truffle compile',
    testCommand: '../node_modules/.bin/truffle test test/heavy_polygon.js test/light_polygon.js test/circle.js',
    // norpc: false,
    // // dir: './contracts',
    // copyPackages: ['zeppelin-solidity'],
    // copyPackages: ['solidity-gis'],
    skipFiles: ['libs/ConvertLib.sol', 'libs/ArrayMemory32Lib.sol', 'libs/ArrayStorage32Lib.sol', 'libs/ArrayStorageU32Lib.sol', 'libs/SafeMath32.sol']
};