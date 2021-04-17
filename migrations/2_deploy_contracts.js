var SmartBet = artifacts.require("./SmartBet.sol");
var SmartInvestV1 = artifacts.require("./SmartInvestV1.sol");
var PriceConsumerV3 = artifacts.require("./PriceConsumerV3.sol");

module.exports = function(deployer) {
  deployer.deploy(PriceConsumerV3);
  // deployer.deploy(SmartInvestV1);
};
