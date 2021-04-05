module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  compilers: {
    solc: {
      version: "^0.7.0"
    }
  },
  networks: {
    genache: {
      host: "localhost",
      port: 7545,
      gas: 5000000,
      network_id: "*"
    }
  }
};
