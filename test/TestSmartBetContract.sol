pragma solidity ^0.7.0;
pragma abicoder v2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/SmartBet.sol";

contract TestSmartBetContract {

  function testAssert() public {
    Assert.equal(uint(0), uint(SmartBet.MatchResult.NOT_DETERMINED), "Newly created match result should be NOT_DETERMINED");
  }

  function testItCreatesMatchWithNotDeterminedResult() public {
    SmartBet smartBet = SmartBet(DeployedAddresses.SmartBet());

    uint256 matchId = smartBet.createMatch("hello", 1.0, 2.0, block.timestamp);

    SmartBet.Match memory fetchedMatch = smartBet.getMatch(matchId);

    // (uint8 oddsTeamA, uint8 oddsTeamB, bytes32 matchResultLink, uint256 totalPayoutTeamA, uint256 totalPayoutTeamB, 
    // uint256 totalCollected, SmartBet.MatchResult result, SmartBet.MatchState state, bool exists) = smartBet.getMatch(matchId);
    Assert.equal(uint(fetchedMatch.result), uint(SmartBet.MatchResult.NOT_DETERMINED), "Newly created match result should be NOT_DETERMINED");
  }

}
