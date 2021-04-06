pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@chainlink/contracts/src/v0.7/ChainlinkClient.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
// import "@openzeppelin/contracts/math/SafeMath.sol";

// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/18c7efe800df6fc19554ece3b1f238e9e028a1db/contracts/token/ERC721/ERC721.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/18c7efe800df6fc19554ece3b1f238e9e028a1db/contracts/utils/Counters.sol";


/*
 * @notice SmartBet core smart contract. Handles matches, bets and farming
 */
contract SmartBet is ERC721, ChainlinkClient {

    using Counters for Counters.Counter;
    // using SafeMath for uint256;

    ////////////////////////////////////////
    //                                    //
    //         STATE VARIABLES            //
    //                                    //      
    ////////////////////////////////////////
    // contract owner adress
    address private owner;

    // incremented for match id generation
    Counters.Counter private matchIds;

    // incremented id for NFT minting
    Counters.Counter private tokenIds;

    // total funds available
    uint256 public totalTreasury;

    // flag to determine if contracts core functionalities can be performed
    bool circuitBreaker = false;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    enum MatchResult {NOT_DETERMINED, DRAW, TEAM_A_WON, TEAM_B_WON}
    enum MatchState {NOT_STARTED, STARTED, FINISHED}

    uint8 private constant TEAM_A = 1;
    uint8 private constant TEAM_B = 2;

    struct Match {
        address creator;
        uint8 oddsTeamA;
        uint8 oddsTeamB;
        uint8 oddsDraw;
        string matchResultLink;
        uint256 totalPayoutTeamA;
        uint256 totalPayoutTeamB;
        uint256 totalPayoutDraw;
        uint256 totalCollected;
        MatchResult result;
        MatchState state;
        bool exists;
    }

    // NFT issued to winner
    struct SmartAsset {
        address owner;
        uint256 matchId;
        MatchResult matchResult;
        uint256 initialValue;
        uint8 accruedInterest;
    }

    // holds all NFTs issued to winners
    mapping(uint256 => SmartAsset) smartAssets;

    // holds all created matches (key: idCounter)
    mapping(uint256 => Match) matches;
    
    // holds all apiMatchId -> onChainMatchId to prevent duplicate entries
    mapping(uint256 => uint256) apiMatches;

    // holds all bets on a match
    // mapping(matchId => mapping(gameResult => tokenIds[])) matchBets;
    mapping(uint256 => mapping(MatchResult => uint256[])) matchBets;

    mapping(bytes32 => uint256) matchResultRequestIds;


    ////////////////////////////////////////
    //                                    //
    //           CONSTRUCTOR              //
    //                                    //      
    ////////////////////////////////////////

    constructor() ERC721("SmartBet", "SMBT") {
        owner = msg.sender;
        // setPublicChainlinkToken();
        oracle = 0x2f90A6D021db21e1B2A077c5a37B3C7E75D15b7e;
        jobId = "29fa9aa13bf1468788b7cc4a500a45b8";
        fee = 0.1 * 10 ** 18; // 0.1 LINK
    }

    ////////////////////////////////////////
    //                                    //
    //              EVENTS                //
    //                                    //      
    ////////////////////////////////////////

    //Can be used by the clients to get all matches in a particular time
    event LogMatchAdded(address indexed creator, uint256 matchId, uint256 indexed startAt);
    //Can be used by the clients to get all bets placed by a better in a particular time
    event LogBetAdded(address indexed bettor, uint256 indexed matchId, uint256 amount, uint256 indexed betAt);
    event LogCloseMatch(address indexed by, uint256 indexed matchId);
    event LogSetResult(uint256 indexed matchId, MatchResult result);
    event LogWithdrawal(address indexed by, uint256 indexed matchId, uint256 amount);


    ////////////////////////////////////////
    //                                    //
    //              MODIFIERS             //
    //                                    //      
    ////////////////////////////////////////

    /*
    *  @notice  Restrict caller only owner
    */
    modifier onlyOwner() {
        require(msg.sender == owner, "caller is not owner");
        _;
    }

    /*
    *  @notice  Ensure match does not previously exist
    */
    modifier isNewMatch(uint256 _matchId) {
        require(!matches[_matchId].exists, "on chain match exists");
        _;
    }

    /*
    *  @notice  Ensure api match does not previously exist
    */
    modifier isNewAPIMatch(uint256 _api_matchId) {
        require(apiMatches[_api_matchId] == 0, "api match exists");
        _;
    }

    /*
    *  @notice  Ensure match exists
    */
    modifier matchExists(uint256 _matchId){
        require(matches[_matchId].exists, "on chain match does not exist");
        _;
    }

    /*
    *  @notice  Ensure match has not started
    */
    modifier matchNotStarted(uint256 _matchId){
        require(matches[_matchId].state == MatchState.NOT_STARTED, "match started");
        _;
    }

    /*
    *  @notice  Ensure match has started
    */
    modifier matchStarted(uint256 _matchId){
        require(matches[_matchId].state == MatchState.STARTED, "match not started");
        _;
    }

    /*
    *  @notice  Ensure match has ended
    */
    modifier matchFinished(uint256 _matchId){
        require(matches[_matchId].state == MatchState.FINISHED, "match not finished");
        _;
    }

    /*
    *  @notice Checks if core functionalities can be performed
    *  @dev Checks if the circuitBreaker state variable is false
    */
    modifier isCircuitBreakOff() {
        require(!circuitBreaker, "Circuit breaker is on");
        _;
    }

    /*
    *  @notice Checks if the NFT is valid
    *  @dev Validates NFT
    */
    modifier validateToken(uint256 _tokenId) {
        require(_exists(_tokenId), "Invalid token");
        _;
    }
    
    /*
    *  @notice  Ensure token belongs to the caller
    */
    modifier isTokenOwner(uint256 _tokenId) {
        require(ownerOf(_tokenId) == msg.sender , "caller is not token owner");
        _;
    }

    /*
    *  @notice  Ensures bets are allowed on the match
    *  @dev     The totalCollected on the match must be greater than the total payout on the team the bettor wants to bet on. The incoming bet is inclusive in the calculation
    */
    modifier isBetAllowed(uint256 _matchId) {
        require(true, "Bet is not allowed");
        _;
    }
    
    modifier validateMatchResult(uint8 _matchResult) {
        require(MatchResult(_matchResult) == MatchResult.TEAM_A_WON || MatchResult(_matchResult) == MatchResult.TEAM_B_WON || MatchResult(_matchResult) == MatchResult.DRAW, "Invalid match result");
        _;
    }



    ////////////////////////////////////////
    //                                    //
    //              FUNCTIONS             //
    //                                    //      
    ////////////////////////////////////////

    /*
    *  @notice  Contract Circuit Breaker
    *  @dev     Admin can [de]activate core functons in contract
    *  @param   
    *  @return  success success status
    */
    function toggleCircuitBreaker()
        public 
        onlyOwner
    {
        //code
        circuitBreaker = !circuitBreaker;
    }
    
    
    /*
    *  @notice  New match creation
    *  @dev     
    *  @param   
    *  @return  match Id
    */
    function createMatch(uint256 _apiMatchId, string memory _matchResultLink, uint8 _oddsTeamA, uint8 _oddsTeamB, uint8 _oddsDraw, uint256 _startAt)
        public 
        isNewAPIMatch(_apiMatchId)
        onlyOwner
        returns(uint)
    {
        matchIds.increment();
        uint256 matchId = matchIds.current();
        matches[matchId] = Match(msg.sender, _oddsTeamA, _oddsTeamB, _oddsDraw, _matchResultLink, 0, 0, 0, 0, MatchResult.NOT_DETERMINED, MatchState.NOT_STARTED, true); 
        apiMatches[_apiMatchId] = matchId;
        emit LogMatchAdded(msg.sender, matchId, _startAt);

        return matchId;
    }


    /*
    *  @notice  New bet creation. Mint NFT to bettor
    *  @dev   
    *  @param  
    *  @return  token id
    */
    function placeBet(uint128 _matchId, uint8 _resultBetOn)
        public 
        payable
        matchExists(_matchId) 
        matchNotStarted(_matchId) 
        isBetAllowed(_matchId)
        validateMatchResult(_resultBetOn)
        returns(uint256)
    {
        require(msg.value != 0, "Invalid amount bet");

        address bettor = msg.sender;
        uint256 amountBet = msg.value;
        uint256 assetValue = 0;
        MatchResult matchResultBetOn = MatchResult(_resultBetOn);
        
        //update team's total payout
        if (matchResultBetOn == MatchResult.TEAM_A_WON) {
            assetValue = amountBet * matches[_matchId].oddsTeamA;
            matches[_matchId].totalPayoutTeamA += assetValue;
        } else if(matchResultBetOn == MatchResult.TEAM_B_WON) {
            assetValue = amountBet * matches[_matchId].oddsTeamB;
            matches[_matchId].totalPayoutTeamB += assetValue;
        } else {
            assetValue = amountBet * matches[_matchId].oddsDraw;
            matches[_matchId].totalPayoutDraw += assetValue;
        }

        //increase totalCollected on the match
        matches[_matchId].totalCollected += amountBet;

        uint256 tokenId = awardSmartAsset(bettor, assetValue, _matchId, matchResultBetOn);
        
        //Save bettor's bet
        matchBets[_matchId][matchResultBetOn].push(tokenId);
        
        emit LogBetAdded(bettor, _matchId, amountBet, block.timestamp);

        return tokenId;
    }


    function awardSmartAsset(address bettor, uint256 assetValue, uint256 _matchId, MatchResult _matchResultBetOn) internal returns (uint256) {
        tokenIds.increment();

        uint256 smartAssetId = tokenIds.current();
        _mint(bettor, smartAssetId);
        
        smartAssets[smartAssetId] = SmartAsset(msg.sender, _matchId, _matchResultBetOn, assetValue, 0);

        return smartAssetId;
    }
    
    function startMatch(uint128 _matchId) 
        public
        onlyOwner
        matchExists(_matchId) 
        matchNotStarted(_matchId)
    {
        matches[_matchId].state = MatchState.STARTED;
    }


    /*
    *  @notice  Match manual close by admin. Trigger "getResult()" 
    *  @dev     [Real] ChainlinkClient API Request oracles gets match result of winning team. Then, match is closed.
    *           [Temporary] (Implemented because there's no BSC testnet oracle node)
    *                       Frontend gets result via result link and posts winning team. Then, match is closed.
    *  @param  
    *  @return  success success status
    */
    function closeMatch(uint128 _matchId, uint8 _matchResult)
        public 
        onlyOwner
        matchExists(_matchId) 
        matchStarted(_matchId)
        validateMatchResult(_matchResult)
    {
        matches[_matchId].state = MatchState.FINISHED;
        
        // getMatchResult(_matchId);
        MatchResult matchResult = MatchResult(_matchResult);
        setMatchResult(_matchId, matchResult);
        
        if (matchResult == MatchResult.TEAM_A_WON) {
            invalidateAssets(matchBets[_matchId][MatchResult.TEAM_B_WON]);
            invalidateAssets(matchBets[_matchId][MatchResult.DRAW]);
        } else if (matchResult == MatchResult.TEAM_B_WON) {
            invalidateAssets(matchBets[_matchId][MatchResult.TEAM_A_WON]);
            invalidateAssets(matchBets[_matchId][MatchResult.DRAW]);
        } else {
            invalidateAssets(matchBets[_matchId][MatchResult.TEAM_A_WON]);
            invalidateAssets(matchBets[_matchId][MatchResult.TEAM_B_WON]);
        }
        
        
        emit LogCloseMatch(msg.sender, _matchId);
    }
    
    function setMatchResult(uint256 _matchId, MatchResult _matchResult) internal {
        matches[_matchId].result = _matchResult;
        emit LogSetResult(_matchId, matches[_matchId].result);
    }
    
    function invalidateAssets(uint256[] memory assets) internal {
        for (uint i = 0; i < assets.length; i++) {
            _burn(assets[i]);
        }
    }


    /*
    *  @notice  Funds withdrawal by winner
    *  @dev     validated   NFT is burned and caller gets value funds in account
    *  @param   _tokenId    NFT token id
    *  @return  success success status
    */
    function withdraw(uint128 _tokenId)
        public 
        payable
        validateToken(_tokenId)
        isTokenOwner(_tokenId)
        returns(bool)
    {
        SmartAsset memory smartAsset = smartAssets[_tokenId];
        
        require(matches[smartAsset.matchId].state == MatchState.FINISHED, "Cannot withdraw until match is finished");
        
        require (address(this).balance >= smartAsset.initialValue, "Contract has insufficient funds");
        
        _burn(_tokenId);
        msg.sender.transfer(smartAsset.initialValue);

        emit LogWithdrawal(msg.sender, smartAsset.matchId, smartAsset.initialValue);
        return true;
    }

    /*
    *  @notice  Fetch match details
    *  @dev         
    *  @oaram   _matchId
    *  @return match match details
    */
    function getMatch(uint256 _matchId)
        public 
        view
        matchExists(_matchId)
        returns(Match memory match_)
    {
        return matches[_matchId];
    }


    /*
    *  @notice  Fetch match result with a call through ChainlinkClient.
    *  @dev     ChainlinkClient Oracle. Callback function "setMatchResult()"
    *  @oaram   _matchId
    *  @return request ID
    */
    function getMatchResult(uint256 _matchId)
        internal 
        view
        matchFinished(_matchId)
    {
        // Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.setMatchResult.selector);
        
        // // Set the URL to perform the GET request on
        // request.add("get", matches[_matchId].matchResultLink);
        
        // // Set the path to find the desired data in the API response, where the response format is:
        // request.add("path", "api.results.fixtures[0].goalsHomeTeam");
        
        // // Sends the request
        // bytes32 requestId = sendChainlinkRequestTo(oracle, request, fee);
        // matchResultRequestIds[requestId] = _matchId;
    }

     /*
    *  @notice  Set Match results
    *  @dev   
    *  @param  
    *  @return  success success status
    */
    // function setMatchResult(bytes32 _requestId, uint8 _matchResult)
    //     public 
    //     matchExists(matchResultRequestIds[_requestId]) 
    //     matchFinished(matchResultRequestIds[_requestId])
    // {
    //     uint256 matchId = matchResultRequestIds[_requestId];
    //     matches[matchId].result = MatchResult(_matchResult);
    //     emit LogSetResult(matchId, matches[matchId].result);
    // }
    
    /*
    *  @notice  Fetch all NFTs (SmartAssets)
    *  @dev             
    *  @return  assets Array of all NFTs
    */
    // function allSmartAssets()
    //     public 
    //     view
    //     returns(SmartAsset[] memory _assets)
    // {
    //     //code        
    // }


    /*
    *  @notice  Fetch single NFT (SmartAsset)
    *  @dev          
    *  @param   _tokenId
    *  @return  asset NFT details
    */
    function getSmartAsset(uint256 _tokenId)
        public 
        view
        validateToken(_tokenId)
        isTokenOwner(_tokenId)
        returns(SmartAsset memory asset)
    {
        return smartAssets[_tokenId];
    }
    
}
