var SmartBet = artifacts.require("./SmartBet.sol");
var SmartInvestV1 = artifacts.require("./SmartInvestV1.sol");
var PriceConsumerV3 = artifacts.require("./PriceConsumerV3.sol");

module.exports = async function(deployer) {
  await deployer.deploy(SmartBet);
  await deployer.deploy(SmartInvestV1);
};
