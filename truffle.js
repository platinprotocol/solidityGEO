let mainNetProvider;

const PrivateKeyProvider =  require("truffle-privatekey-provider");
const ropsenPk = ""; // private keys
const poaPk = ""; // private keys

module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 7545,
            network_id: "5777",
            gas: 8000000,
            gasPrice: 5000000000
        },
        ropsten: {
            provider: () => {
                return new PrivateKeyProvider(ropsenPk, "http://rbst1.betex.io:8545")
            },
            network_id: 3,
            gas: 4000000,
            gasPrice: 30000000000
        },
        mainnet: {
            provider: mainNetProvider,
            network_id: "1",
            gas: 8000000
        },
        poa: {
            provider: () => {
                return new PrivateKeyProvider(poaPk, "https://eth-poa.betex.io")
            },
            network_id: 5106604,
            gas: 12000000,
            gasPrice: 110000000000
        }
    }
};