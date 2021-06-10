'use strict';

require('dotenv').config();

const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = process.env.MNEMONIC;

module.exports = {
  networks: {
    test: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/");
      },
      network_id: '*',
    },
    local: {
      host: 'localhost',
      port: 9545,
      gas: 5000000,
      gasPrice: 5e9,
      network_id: '*'
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`, 0, 2)
      },
      network_id: '4'
      // gasPrice: 10000000000
    },
    mainnet: {
      provider: function() {
        return new HDWalletProvider(mnemonic, `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`, 0, 2)
      },
      gasPrice: 42e9,
      network_id: '1'
    }
  },
  compilers: {
    solc: {
      version: "0.5.17",
      // docker: true,
      // settings: {
      //  optimizer: {
      //    enabled: true,
      //    runs: 200
      //  }
      // }
    }
  }
};
