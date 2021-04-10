const SmartBet = artifacts.require("./SmartBet.sol");
let catchCustomError = require("./exceptionsHelpers.js").catchCustomError;

contract("SmartBet", async (accounts) => {
    const smartBetInstance = await SmartBet.deployed();
    const owner = accounts[0];
    const bettor1 = accounts[1];
    const bettor2 = accounts[2];
    it("should only allow the owner of the contract create a match", async() => {
        catchCustomError(smartBetInstance.createMatch(1, "http://test.com", 1, 2, 3, 23424535654, 
            {from: bettor1}), "caller is not owner");
        
        smartBetInstance.createMatch(2, "http://test.com", 1, 2, 3, 23424535654, 
            {from: owner});
    });

    it("should not allow matches with duplicate api match id", async() => {

    });
});