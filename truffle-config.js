const path = require("path");
const fs = require('fs');

const HDWalletProvider = require('@truffle/hdwallet-provider');
const bscTestnetURL = 'https://data-seed-prebsc-1-s1.binance.org:8545';

const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  compilers: {
    solc: {
      version: "^0.7.0",
      settings: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
    }
  },
  networks: {
    ganache: {
      host: "localhost",
      port: 7545,
      // gas: 5000000,
      network_id: "*"
    },
    bsc_testnet: {
      provider: () => new HDWalletProvider(mnemonic, bscTestnetURL),
      network_id: 97,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },

  }
};
