var SmartBet = artifacts.require("./SmartBet.sol");
var SmartInvestV1 = artifacts.require("./SmartInvestV1.sol");

module.exports = async function(deployer) {
  await deployer.deploy(SmartBet);
  await deployer.deploy(SmartInvestV1);
};
