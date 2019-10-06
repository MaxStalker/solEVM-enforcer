'use strict';

module.exports = {
  compilers: {
    solc: {
      version: '0.5.2',
      settings: {
        optimizer: {
          enabled: true,
          runs: 2,
        },
        evmVersion: 'constantinople',
      },
    },
  },
  networks: {
    goerli: {
      //url: 'https://goerli.infura.io/v3/' + process.env.INFURA_API_KEY,
      //url: 'http://goerli.prylabs.net',
      url: 'https://rpc.goerli.mudit.blog',
      network_id: '5', // eslint-disable-line camelcase
      gas: 6465030,
      gasPrice: 10000000000,
    },
    ganache: {
      url: 'http://localhost:8545',
      network_id: '*', // eslint-disable-line camelcase
      gas: 6465030,
      gasPrice: 1,
    },
    geth: {
      url: 'http://localhost:8222',
      network_id: '*', // eslint-disable-line camelcase
      gas: 7000000,
      gasPrice: 1,
    },
  },
};
