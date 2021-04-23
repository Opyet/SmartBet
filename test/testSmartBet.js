const SmartBet = artifacts.require("./SmartBet.sol");
let catchCustomError = require("./exceptionsHelpers.js").catchCustomError;
let BN = web3.utils.BN;
let toWei = web3.utils.toWei;

contract("SmartBet", async (accounts) => {
    let smartBetInstance;
    let owner;
    let bettor;
    let bettor2;
    const MATCH_RESULT_API = "http://test.com/";

    beforeEach(async () => {
        owner = accounts[0];
        bettor = accounts[1];
        bettor2 = accounts[2];
        smartBetInstance = await SmartBet.new();
    });

    context("when create match is called", function () {
        it("should only allow the contract owner create a match", async() => {
            await catchCustomError(createTestMatch(1, 1, 2, 3, bettor), "caller is not owner");
            await createTestMatch();
        });
    
        it("should not allow matches with duplicate api match id", async() => {
            await createTestMatch(1);
            await catchCustomError(createTestMatch(1), "api match ID exists");
        });
    
        it("should create matches with correct details", async() => {
            let apiMatchId = 1;
            let oddsTeamA = 1;
            let oddsTeamB = 2;
            let oddsDraw = 3;
            let matchResultLink = MATCH_RESULT_API + apiMatchId;
            let result = await createTestMatch(apiMatchId, oddsTeamA, oddsTeamB, oddsDraw, owner, matchResultLink);
    
            let matchId = getMatchIdFromResult(result);
    
            let match = await smartBetInstance.getMatch(matchId);
    
            expect(match['creator']).to.equals(owner, "incorrect match creator");
            assert.equal(match['oddsTeamA'], oddsTeamA, "incorrect match oddsTeamA");
            assert.equal(match['oddsTeamB'], oddsTeamB, "incorrect match oddsTeamB");
            assert.equal(match['oddsDraw'], oddsDraw, "incorrect match oddsDraw");
            expect(match['matchResultLink']).to.equals(matchResultLink, "incorrect match resultLink");
            assert.equal(match['totalPayoutTeamA'], 0, "incorrect match totalPayoutTeamA");
            assert.equal(match['totalPayoutTeamB'], 0, "incorrect match totalPayoutTeamB");
            assert.equal(match['totalPayoutDraw'], 0, "incorrect match totalPayoutDraw");
            assert.equal(match['totalCollected'], 0, "incorrect match totalCollected");
            assert.equal(match['result'], SmartBet.enums.MatchResult.NOT_DETERMINED, "incorrect match result");
            assert.equal(match['state'], SmartBet.enums.MatchState.NOT_STARTED, "incorrect match state");
            expect(match['exists']).to.be.true;
        });
    
        it("should emit MatchCreatedEvent when match is created successfully", async() => {
            let result = await createTestMatch(2, 1, 2, 3);
    
            let eventLogs = result.logs
                .filter(log => log.event && log.event == 'MatchCreatedEvent');
            assert.isNotEmpty(eventLogs, "MatchCreatedEvent was not emitted");
            assert.lengthOf(eventLogs, 1, "More than one MatchCreatedEvent was emitted");
            expect(eventLogs[0].args['creator']).to.equals(owner);
            expect(eventLogs[0].args['matchId'].toNumber()).to.equals(1);
        });
    });

    context("when place bet is called", function() {
        it("should only allow bets on match that exist", async() => {
            await catchCustomError(smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_A_WON), 
                "on chain match does not exist");
        });
    
        it("should only allow bets on match that have not started", async() => {
            await createTestMatch();
            await smartBetInstance.startMatch(1);
            await catchCustomError(smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor, value: generateValue(1)}), 
                "match started");
    
            await smartBetInstance
                .createMatch(2, MATCH_RESULT_API + 2, 1, 2, 3, Math.floor((Date.now() - 60000) /1000), {from: owner});
            await smartBetInstance.placeBet(2, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor, value: generateValue(1)});
            await catchCustomError(smartBetInstance.placeBet(2, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor, value: generateValue(1)}), 
                "match started");
        });
    
        //TODO
        it("should only allow bets on a match if bet is allowed", async() => {
            
        });
    
        it("should only allow valid match results to be bet on", async() => {
            await createTestMatch();
            await catchCustomError(smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.NOT_DETERMINED, 
                {from: bettor, value: generateValue(1)}), 
                "Invalid match result");
        });
    
        it("should only allow amounts greater than zero to be staked for bet", async() => {
            await createTestMatch();
            await catchCustomError(smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor, value: 0}), 
                "Invalid amount bet");
        });
    
        it("should update the total payout on the match result outcome that is bet on", async() => {
            let oddsTeamA = 2;
            let oddsTeamB = 3;
            let oddsDraw = 4;
            let bettor1Stake = generateValue(1);
            let bettor2Stake = generateValue(2);
            let totalExpectedPayout = bettor1Stake.mul(new BN(oddsTeamA)).add(bettor2Stake.mul(new BN(oddsTeamA))).div(new BN(100));
    
            await createTestMatch(1, oddsTeamA, oddsTeamB, oddsDraw);
            await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor, value: bettor1Stake});
            await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor2, value: bettor2Stake});
    
            let match = await smartBetInstance.getMatch(1);
            expect(match['totalPayoutTeamA']).to.equal(totalExpectedPayout.toString(), "Incorrect totalPayoutTeamA value");
    
            bettor1Stake = generateValue(2);
            bettor2Stake = generateValue(2);
            totalExpectedPayout = bettor1Stake.mul(new BN(oddsTeamB)).add(bettor2Stake.mul(new BN(oddsTeamB))).div(new BN(100));
            await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_B_WON, 
                {from: bettor, value: bettor1Stake});
            await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_B_WON, 
                {from: bettor2, value: bettor2Stake});
    
            match = await smartBetInstance.getMatch(1);
            expect(match['totalPayoutTeamB']).to.equal(totalExpectedPayout.toString(), "Incorrect totalPayoutTeamB value");
    
            bettor1Stake = generateValue(3);
            bettor2Stake = generateValue(2);
            totalExpectedPayout = bettor1Stake.mul(new BN(oddsDraw)).add(bettor2Stake.mul(new BN(oddsDraw))).div(new BN(100));
            await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.DRAW, 
                {from: bettor, value: bettor1Stake});
            await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.DRAW, 
                {from: bettor2, value: bettor2Stake});
    
            match = await smartBetInstance.getMatch(1);
            expect(match['totalPayoutDraw']).to.equal(totalExpectedPayout.toString(), "Incorrect totalPayoutDraw value");
        });
    
        it("should update the total amount collected on the match", async() => {
            let bettor1Stake = generateValue(1);
            let bettor2Stake = generateValue(2);
            let totalExpectedCollected = bettor1Stake.mul(new BN(2)).add(bettor2Stake.mul(new BN(3)));
    
            await createTestMatch();
            await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor, value: bettor1Stake});
            await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_B_WON, 
                {from: bettor2, value: bettor1Stake});
    
            await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_B_WON, 
                {from: bettor2, value: bettor2Stake});
            await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor2, value: bettor2Stake});
            await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.DRAW, 
                {from: bettor2, value: bettor2Stake});
    
            let match = await smartBetInstance.getMatch(1);
            expect(match['totalCollected']).to.equal(totalExpectedCollected.toString(), "Incorrect totalCollected value");
        });
    
        it("should issue asset with correct values when bet is placed", async() => {
            let oddsTeamA = 4;
            let bettor1Stake = generateValue(1);
            let expectedAssetValue = bettor1Stake.mul(new BN(oddsTeamA)).div(new BN(100));
            let resultBetOn = SmartBet.enums.MatchResult.TEAM_A_WON;
    
            await createTestMatch(1, oddsTeamA);
            let result = await smartBetInstance.placeBet(1, resultBetOn, 
                {from: bettor, value: bettor1Stake});
    
            let eventLogs = result.logs
                .filter(log => log.event && log.event == 'SmartAssetAwardedEvent');
            assert.isNotEmpty(eventLogs, "SmartAssetAwardedEvent was not emitted");
            assert.lengthOf(eventLogs, 1, "More than one SmartAssetAwardedEvent was emitted");
            expect(eventLogs[0].args['awardee']).to.equal(bettor, "Incorrect smart asset awardee");
    
            let smartAssetId = eventLogs[0].args['smartAssetId'];
            let smartAsset = await smartBetInstance.getSmartAsset(smartAssetId, {from: bettor});
            expect(smartAsset['owner']).to.equal(bettor, "Incorrect asset owner");
            expect(smartAsset['matchId']).to.equal('1', "Incorrect match id on smart asset");
            expect(smartAsset['accruedInterest']).to.equal('0', "Incorrect accured interest");
            assert.equal(smartAsset['matchResult'], resultBetOn, "Incorrect match result on smart asset");
            expect(smartAsset['initialValue']).to.equal(expectedAssetValue.toString(), "Incorrect asset value");
        });
    
        it("should not be allowed to place bet if circuit breaker is on", async() => {
            await createTestMatch();
    
            await smartBetInstance.toggleCircuitBreaker();
    
            await catchCustomError(smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor, value: generateValue(1)}), "Circuit breaker is on");
    
            await smartBetInstance.toggleCircuitBreaker();
            await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor, value: generateValue(1)});
        });
    
        it("should emit BetPlacedEvent when bet is placed successfully", async() => {
            let bettor1Stake = generateValue(1);
    
            await createTestMatch(1);
            let result = await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor, value: bettor1Stake});
    
            let eventLogs = result.logs
                .filter(log => log.event && log.event == 'BetPlacedEvent');
            assert.isNotEmpty(eventLogs, "BetPlacedEvent was not emitted");
            assert.lengthOf(eventLogs, 1, "More than one BetPlacedEvent was emitted");
            expect(eventLogs[0].args['bettor']).to.equal(bettor, "Incorrect bettor");
            expect(eventLogs[0].args['matchId'].toString()).to.equal('1', "Incorrect match ID");
            expect(eventLogs[0].args['amount'].toString()).to.equal(bettor1Stake.toString(), "Incorrect bet placed amount");
        });
    });

    context("when start match is called", function() {
        it("should only allow contract owner start a match", async() => {
            await createTestMatch();
            await catchCustomError(smartBetInstance.startMatch(1, {from: bettor}), 
                "caller is not owner");
        });
    
        it("should only allow match that exist to be started", async() => {
            await catchCustomError(smartBetInstance.startMatch(1), 
                "on chain match does not exist");
        });
    
        it("should only allow match that has not started to be started", async() => {
            await createTestMatch();
            await smartBetInstance.startMatch(1);
            await catchCustomError(smartBetInstance.startMatch(1), 
                "match started");
        });
    
        it("should update the state of the match to started when started", async() => {
            await createTestMatch();
            await smartBetInstance.startMatch(1);
    
            let match = await smartBetInstance.getMatch(1);
            assert.equal(match['state'], SmartBet.enums.MatchState.STARTED);
        });
    });

    context("when close match is called", function() {
        it("should only allow contract owner close a match", async() => {
            await createTestMatch();
            await smartBetInstance.startMatch(1);
            await catchCustomError(smartBetInstance.closeMatch(1, SmartBet.enums.MatchResult.TEAM_A_WON, {from: bettor}), 
                "caller is not owner");
        });
    
        it("should only allow match that exist to be closed", async() => {
            await catchCustomError(smartBetInstance.closeMatch(1, SmartBet.enums.MatchResult.TEAM_A_WON), 
                "on chain match does not exist");
        });
    
        it("should only allow match that has started to be closed", async() => {
            await createTestMatch();
            await catchCustomError(smartBetInstance.closeMatch(1, SmartBet.enums.MatchResult.TEAM_A_WON), 
                "match not started");
        });
    
        it("should only allow valid match result when closing a match", async() => {
            await createTestMatch();
            await smartBetInstance.startMatch(1);
            await catchCustomError(smartBetInstance.closeMatch(1, SmartBet.enums.MatchResult.NOT_DETERMINED), 
                "Invalid match result");
        });
    
        it("should update the state of the match to finished when closed", async() => {
            await createTestMatch();
            await smartBetInstance.startMatch(1);
            await smartBetInstance.closeMatch(1, SmartBet.enums.MatchResult.TEAM_A_WON);
            
            let match = await smartBetInstance.getMatch(1);
            assert.equal(match['state'], SmartBet.enums.MatchState.FINISHED, "Incorrect match state");
        });
    
        it("should update the result of the match correctly", async() => {
            await createTestMatch();
            await smartBetInstance.startMatch(1);
            await smartBetInstance.closeMatch(1, SmartBet.enums.MatchResult.TEAM_A_WON);
            
            let match = await smartBetInstance.getMatch(1);
            assert.equal(match['result'], SmartBet.enums.MatchResult.TEAM_A_WON, "Incorrect match result");
        });
    
        it("should emit MatchResultSetEvent when match is closed successfully", async() => {
            await createTestMatch();
            await smartBetInstance.startMatch(1);
            let result = await smartBetInstance.closeMatch(1, SmartBet.enums.MatchResult.TEAM_B_WON);
    
            let eventLogs = result.logs
                .filter(log => log.event && log.event == 'MatchResultSetEvent');
            assert.isNotEmpty(eventLogs, "MatchResultSetEvent was not emitted");
            assert.lengthOf(eventLogs, 1, "More than one MatchResultSetEvent was emitted");
            assert.equal(eventLogs[0].args['result'].toNumber(), SmartBet.enums.MatchResult.TEAM_B_WON, "Incorrect match result");
            expect(eventLogs[0].args['matchId'].toString()).to.equal('1', "Incorrect match ID");
        });
    
        it("should only invalidate assets of match losers when a match is closed", async() => {
            let bettor1Stake = generateValue(1);
            let bettor2Stake = generateValue(2);
    
            await createTestMatch(1);
    
            //bettor1 place bet
            let result = await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor, value: bettor1Stake});
    
            let bettor1SmartAssetId = getSmartAssetIdFromResult(result);
            await smartBetInstance.getSmartAsset(bettor1SmartAssetId, {from: bettor});
    
            //bettor2 place bet
            result = await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.DRAW, 
                {from: bettor2, value: bettor2Stake});
    
            let bettor2SmartAssetId = getSmartAssetIdFromResult(result);
            await smartBetInstance.getSmartAsset(bettor2SmartAssetId, {from: bettor2});
    
            await smartBetInstance.startMatch(1);
            await smartBetInstance.closeMatch(1, SmartBet.enums.MatchResult.DRAW);
    
            await catchCustomError(smartBetInstance.getSmartAsset(bettor1SmartAssetId, {from: bettor}), "Invalid token");
            await smartBetInstance.getSmartAsset(bettor2SmartAssetId, {from: bettor2});
        });
    
        it("should emit MatchClosedEvent when match is closed successfully", async() => {
            await createTestMatch();
            await smartBetInstance.startMatch(1);
            let result = await smartBetInstance.closeMatch(1, SmartBet.enums.MatchResult.TEAM_B_WON);
    
            let eventLogs = result.logs
                .filter(log => log.event && log.event == 'MatchClosedEvent');
            assert.isNotEmpty(eventLogs, "MatchClosedEvent was not emitted");
            assert.lengthOf(eventLogs, 1, "More than one MatchClosedEvent was emitted");
            expect(eventLogs[0].args['by']).to.equal(owner);
            expect(eventLogs[0].args['matchId'].toNumber()).to.equal(1, "Incorrect match ID");
        });
    });

    context("when liquidate asset is called", function() {
        it("should not be allowed to liquidate asset if circuit breaker is on", async() => {
            await createTestMatch();
    
            let result = await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor, value: generateValue(1)});
    
            let bettor1SmartAssetId = getSmartAssetIdFromResult(result);
    
            await smartBetInstance.startMatch(1);
            await smartBetInstance.closeMatch(1, SmartBet.enums.MatchResult.TEAM_A_WON);
    
            await smartBetInstance.toggleCircuitBreaker();
            await catchCustomError(smartBetInstance.liquidateAsset(bettor1SmartAssetId, {from: bettor}), "Circuit breaker is on");
    
            await smartBetInstance.toggleCircuitBreaker();
            await smartBetInstance.liquidateAsset(bettor1SmartAssetId, {from: bettor});
        });
    
        it("should only allow valid assets to liquidated", async() => {
            await createTestMatch();
    
            let result = await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor, value: generateValue(1)});
    
            let bettor1SmartAssetId = getSmartAssetIdFromResult(result);
    
            await smartBetInstance.startMatch(1);
            await smartBetInstance.closeMatch(1, SmartBet.enums.MatchResult.TEAM_A_WON);
    
            await catchCustomError(smartBetInstance.liquidateAsset(bettor1SmartAssetId.add(new BN(1)), {from: bettor}), "Invalid token");
        });
    
        it("should only allow asset owner to liquidate asset", async() => {
            await createTestMatch();
    
            let result = await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor, value: generateValue(1)});
    
            let bettor1SmartAssetId = getSmartAssetIdFromResult(result);
    
            await smartBetInstance.startMatch(1);
            await smartBetInstance.closeMatch(1, SmartBet.enums.MatchResult.TEAM_A_WON);
    
            await catchCustomError(smartBetInstance.liquidateAsset(bettor1SmartAssetId, {from: bettor2}), "caller is not token owner");
        });
    
        it("should only allow assets tied to finished matches to be liquidated", async() => {
            await createTestMatch(1);
            await createTestMatch(2);
    
            let result = await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor, value: generateValue(1)});
            let bettor1SmartAsset1Id = getSmartAssetIdFromResult(result);
    
            result = await smartBetInstance.placeBet(2, SmartBet.enums.MatchResult.TEAM_B_WON, 
                {from: bettor, value: generateValue(1)});
    
            let bettor1SmartAsset2Id = getSmartAssetIdFromResult(result);
    
            await smartBetInstance.startMatch(1);
            await smartBetInstance.startMatch(2);
            await smartBetInstance.closeMatch(2, SmartBet.enums.MatchResult.TEAM_B_WON);
    
            await catchCustomError(smartBetInstance.liquidateAsset(bettor1SmartAsset1Id, {from: bettor}), "Cannot liquidate asset until match is finished");
            await smartBetInstance.liquidateAsset(bettor1SmartAsset2Id, {from: bettor});
        });
    
        it("should invalidate asset after liquidation", async() => {
            await createTestMatch(1);
    
            let result = await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor, value: generateValue(1)});
            let bettor1SmartAssetId = getSmartAssetIdFromResult(result);
    
            await smartBetInstance.startMatch(1);
            await smartBetInstance.closeMatch(1, SmartBet.enums.MatchResult.TEAM_A_WON);
    
            await smartBetInstance.liquidateAsset(bettor1SmartAssetId, {from: bettor});
            await catchCustomError(smartBetInstance.liquidateAsset(bettor1SmartAssetId, {from: bettor}), "Invalid token");
        });
    
        it("should transfer correct asset value to asset owner's address", async() => {
            await createTestMatch(1);
    
            let result = await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor, value: generateValue(1)});
            let bettor1SmartAssetId = getSmartAssetIdFromResult(result);
            let smartAsset = await smartBetInstance.getSmartAsset(bettor1SmartAssetId, {from: bettor});
            let smartAssetValue = smartAsset['initialValue'];
    
            await smartBetInstance.startMatch(1);
            await smartBetInstance.closeMatch(1, SmartBet.enums.MatchResult.TEAM_A_WON);
    
            let bettor1BalanceBefore = await web3.eth.getBalance(bettor);
    
            result = await smartBetInstance.liquidateAsset(bettor1SmartAssetId, {from: bettor});
            let gasUsed = getGasUsedFromResult(result);
            let gasPrice = await web3.eth.getGasPrice();
            let totalGasCost = new BN(gasUsed).mul(new BN(gasPrice));
            let expectedBalanceAfter = new BN(bettor1BalanceBefore).add(new BN(smartAssetValue)).sub(totalGasCost);
    
            let bettor1BalanceAfter = await web3.eth.getBalance(bettor);
    
            expect(bettor1BalanceAfter).to.equal(expectedBalanceAfter.toString(), "Incorrect bettor's balance after asset liquidation");
        });
    
        it("should emit AssetLiquidatedEvent after asset is liquidated successfully", async() => {
            await createTestMatch(1);
    
            let result = await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor, value: generateValue(1)});
            let bettor1SmartAssetId = getSmartAssetIdFromResult(result);
            let smartAsset = await smartBetInstance.getSmartAsset(bettor1SmartAssetId, {from: bettor});
            let smartAssetValue = smartAsset['initialValue'];
    
            await smartBetInstance.startMatch(1);
            await smartBetInstance.closeMatch(1, SmartBet.enums.MatchResult.TEAM_A_WON);
    
            result = await smartBetInstance.liquidateAsset(bettor1SmartAssetId, {from: bettor});
    
            let eventLogs = result.logs
                .filter(log => log.event && log.event == 'AssetLiquidatedEvent');
            assert.isNotEmpty(eventLogs, "AssetLiquidatedEvent was not emitted");
            assert.lengthOf(eventLogs, 1, "More than one AssetLiquidatedEvent was emitted");
            assert.equal(eventLogs[0].args['by'], bettor);
            expect(eventLogs[0].args['matchId'].toString()).to.equal('1', "Incorrect match ID");
            expect(eventLogs[0].args['amount'].toString()).to.equal(smartAssetValue, "Incorrect liquidated amount");
        });
    });

    context("when toogle circuit breaker is called", function() {
        it("should only allow contract owner toogle circuit breaker", async() => {
            await catchCustomError(smartBetInstance.toggleCircuitBreaker({from: bettor}), "caller is not owner");
        });
    });

    context("when get match is called", function() {
        it("should throw error if match ID does not exist", async() => {
            await createTestMatch(1);
            await smartBetInstance.getMatch(1, {from: bettor});
            await catchCustomError(smartBetInstance.getMatch(2, {from: bettor}), "on chain match does not exist");
        });
    });

    context("when get smart asset is called", function() {
        it("should throw error if asset is invalid", async() => {
            await createTestMatch(1);
    
            let result = await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor, value: generateValue(1)});
            let bettor1SmartAssetId = getSmartAssetIdFromResult(result);
    
            await smartBetInstance.getSmartAsset(bettor1SmartAssetId, {from: bettor});
            await catchCustomError(smartBetInstance.getSmartAsset(bettor1SmartAssetId.add(new BN(1)), {from: bettor}), "Invalid token");
        });
    
        it("should only allow asset owner view asset details", async() => {
            await createTestMatch(1);
    
            let result = await smartBetInstance.placeBet(1, SmartBet.enums.MatchResult.TEAM_A_WON, 
                {from: bettor, value: generateValue(1)});
            let bettor1SmartAssetId = getSmartAssetIdFromResult(result);
    
            await smartBetInstance.getSmartAsset(bettor1SmartAssetId, {from: bettor});
            await catchCustomError(smartBetInstance.getSmartAsset(bettor1SmartAssetId, {from: bettor2}), "caller is not token owner");
        });
    
        it("should correct asset details", async() => {
            let resultBetOn = SmartBet.enums.MatchResult.TEAM_A_WON;
            let oddsTeamA = 4;
            let bettor1Stake = generateValue(1);
            let expectedAssetValue = bettor1Stake.mul(new BN(oddsTeamA)).div(new BN(100));
    
            await createTestMatch(1, oddsTeamA);
    
            let result = await smartBetInstance.placeBet(1, resultBetOn, 
                {from: bettor, value: bettor1Stake});
            let smartAssetId = getSmartAssetIdFromResult(result);
    
            let smartAsset = await smartBetInstance.getSmartAsset(smartAssetId, {from: bettor});
            expect(smartAsset['owner']).to.equal(bettor, "Incorrect asset owner");
            expect(smartAsset['matchId']).to.equal('1', "Incorrect match id on smart asset");
            expect(smartAsset['accruedInterest']).to.equal('0', "Incorrect accured interest");
            assert.equal(smartAsset['matchResult'], resultBetOn, "Incorrect match result on smart asset");
            expect(smartAsset['initialValue']).to.equal(expectedAssetValue.toString(), "Incorrect asset value");
        });
    });

    context("when is admin is called", function() {
        it("should return true if the msg.sender is the contract owner and false it's not", async() => {
            let result = await smartBetInstance.isAdmin({from: owner});
            expect(result).to.be.true;
    
            result = await smartBetInstance.isAdmin({from: bettor});
            expect(result).to.be.false;
        });
    });

    context("when change owner is called", function() {
        it("should only allow owner change owner", async() => {
            await catchCustomError(smartBetInstance.changeOwner(accounts[1], {from: accounts[2]}), "caller is not owner");
        });

        it("should change owner correctly", async() => {
            await smartBetInstance.changeOwner(bettor, {from: owner});
            result = await smartBetInstance.isAdmin({from: bettor});
            expect(result).to.be.true;
        });
    });

    function getMatchIdFromResult(result) {
        let matchId = result.logs
            .filter(log => log.event && log.event == 'MatchCreatedEvent')
            .map(log => log.args["matchId"])[0];

        return matchId.toNumber();
    }

    function getSmartAssetIdFromResult(result) {
        let eventLogs = result.logs
            .filter(log => log.event && log.event == 'SmartAssetAwardedEvent');

        return eventLogs[0].args['smartAssetId'];
    }

    async function createTestMatch(apiId, oddsTeamA, oddsTeamB, oddsDraw, creator, matchResultLink) {
        return await smartBetInstance
            .createMatch(apiId ? apiId : 1, matchResultLink ? matchResultLink : MATCH_RESULT_API + apiId, 
            oddsTeamA ? oddsTeamA : 1, 
            oddsTeamB ? oddsTeamB : 2, 
            oddsDraw ? oddsDraw : 3, 
            Math.floor((Date.now() + 60000) / 1000), {from:    creator ? creator : owner});
    }

    function generateValue(transactionValue) {
        return toWei(web3.utils.toBN(transactionValue), "ether");
    }

    function getGasUsedFromResult(result) {
        return result.receipt.gasUsed;
    }
});