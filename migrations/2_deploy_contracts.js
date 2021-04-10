var SmartBet = artifacts.require("./SmartBet.sol");
var SmartInvestV1 = artifacts.require("./SmartInvestV1.sol");

module.exports = function(deployer) {
  // deployer.deploy(SmartBet);
  deployer.deploy(SmartInvestV1);
};
