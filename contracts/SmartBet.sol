pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

// import "@chainlink/contracts/src/v0.7/ChainlinkClient.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./BEP20.sol";
import "./SmartExchange.sol";

// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/18c7efe800df6fc19554ece3b1f238e9e028a1db/contracts/token/ERC721/ERC721.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/18c7efe800df6fc19554ece3b1f238e9e028a1db/contracts/utils/Counters.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/18c7efe800df6fc19554ece3b1f238e9e028a1db/contracts/math/SafeMath.sol";

/*
 * @notice SmartBet core smart contract. Handles matches, bets and farming
 */
contract SmartBet is ERC721 {

    using Counters for Counters.Counter;
    using SafeMath for uint256;

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

    // flag to determine if contracts core functionalities can be performed
    bool circuitBreaker = false;

    enum MatchResult {NOT_DETERMINED, DRAW, TEAM_A_WON, TEAM_B_WON}
    enum MatchState {NOT_STARTED, STARTED, FINISHED}

    uint8 private constant TEAM_A = 1;
    uint8 private constant TEAM_B = 2;

    struct Match {
        address creator;
        uint32 oddsTeamA;
        uint32 oddsTeamB;
        uint32 oddsDraw;
        string matchResultLink;
        uint256 totalPayoutTeamA;
        uint256 totalPayoutTeamB;
        uint256 totalPayoutDraw;
        uint256 totalCollected;
        MatchResult result;
        MatchState state;
        uint256 startsAt;
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
    // mapping(matchId => mapping(gameResult => smartAssetId[])) matchBets;
    mapping(uint256 => mapping(MatchResult => uint256[])) matchBets;

    mapping(bytes32 => uint256) matchResultRequestIds;

    address public constant wBNB = 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd; //underlying asset: wBNB
    address public constant BUSD = 0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47; //underlying asset: BUSD
    address public constant pROUTER = 0xD99D1c33F9fC3444f8101754aBC46c52416550D1; // Pancakeswap Router (BSC Testnet)

    // ExchangeInterface private smartExchange;
    BEP20 private wBNBToken;
    BEP20 private bUSDToken;
    HelperPancakeSwapROUTER private router;


    ////////////////////////////////////////
    //                                    //
    //           CONSTRUCTOR              //
    //                                    //      
    ////////////////////////////////////////

    constructor() ERC721("SmartBet", "SMBT") {
        owner = msg.sender;
        // smartExchange = new SmartExchange();
        // bUSDToken = BEP20(smartExchange.BUSD());
        bUSDToken = BEP20(BUSD);
        wBNBToken = BEP20(wBNB);     // get a handle for the wBNB asset
        bUSDToken = BEP20(BUSD);     // get a handle for the wBNB asset
        router = HelperPancakeSwapROUTER(pROUTER);     // get a handle for the exchange router
    }

    ////////////////////////////////////////
    //                                    //
    //              EVENTS                //
    //                                    //      
    ////////////////////////////////////////

    //Can be used by the clients to get all matches in a particular time
    event MatchCreatedEvent(address creator, uint256 indexed matchId, uint256 indexed apiMatchId, uint256 startAt, uint256 indexed createdOn, uint32 oddsA, uint32 oddsB, uint32 oddsDraw);
    //Can be used by the clients to get all bets placed by a better in a particular time
    event BetPlacedEvent(address indexed bettor, uint256 indexed matchId, uint256 amount, uint256 indexed betPlacedAt);
    event SmartAssetAwardedEvent(address indexed awardee, uint256 indexed matchId, uint256 smartAssetId, uint256 awardedAt);
    event MatchClosedEvent(address indexed by, uint256 indexed matchId, uint256 closedAt);
    event MatchResultSetEvent(uint256 indexed matchId, MatchResult result, uint256 setAt);
    event AssetLiquidatedEvent(address indexed by, uint256 indexed matchId, uint256 amount, uint256 liquidatedAt);


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
        require(apiMatches[_api_matchId] == 0, "api match ID exists");
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
    *  @notice  New match creation
    *  @dev     
    *  @param   
    *  @return  match Id
    */
    function createMatch(uint256 _apiMatchId, string calldata _matchResultLink, uint32 _oddsTeamA, uint32 _oddsTeamB, uint32 _oddsDraw, uint256 _startAt)
        public 
        isNewAPIMatch(_apiMatchId)
        onlyOwner
        returns(uint)
    {
        matchIds.increment();
        uint256 matchId = matchIds.current();
        matches[matchId] = Match(msg.sender, _oddsTeamA, _oddsTeamB, _oddsDraw, _matchResultLink, 0, 0, 0, 0, MatchResult.NOT_DETERMINED, MatchState.NOT_STARTED, _startAt, true); 
        apiMatches[_apiMatchId] = matchId;
        uint256 createdOnDay = block.timestamp - (block.timestamp % 86400);
        emit MatchCreatedEvent(msg.sender, matchId, _apiMatchId, _startAt, createdOnDay, _oddsTeamA, _oddsTeamB, _oddsDraw);

        return matchId;
    }

    function swapBNBForBUSD(uint _minExpectedBUSD) internal returns(uint) {
        wBNBToken.deposit{value: msg.value}(); // deposit native BNB
        wBNBToken.approve(pROUTER, msg.value); // allow pancakeswap router to access wBNB

        uint deadline = block.timestamp + 10 minutes; // addition 10 mins
        
        address[] memory path = new address[](2);
        path[0] = wBNB;
        path[1] = BUSD;
        uint[] memory amounts = router.swapExactTokensForTokens(msg.value, _minExpectedBUSD, path, address(this), deadline);
        
        return amounts[1];
    }
    
    function calculateAssetValue(uint256 amountBet, uint256 _odds) internal pure returns(uint256) {
        return amountBet.mul(_odds).div(100);
    }

    /*
    *  @notice  New bet creation. Mint NFT to bettor
    *  @dev   
    *  @param  
    *  @return  token id
    */
    function placeBet(uint256 _matchId, uint8 _resultBetOn)
        public 
        payable
        isCircuitBreakOff
        matchExists(_matchId) 
        matchNotStarted(_matchId) 
        isBetAllowed(_matchId)
        validateMatchResult(_resultBetOn)
        returns(uint256)
    {
        require(msg.value != 0, "Invalid amount bet");
        if (matches[_matchId].startsAt < block.timestamp) {
            matches[_matchId].state = MatchState.STARTED;
            return 0;
        }

        address bettor = msg.sender;
        uint256 assetValue = 0;

        // uint[] memory amounts = smartExchange.swap(msg.value, address(this));
        // uint256 amountBet = swapBNBForBUSD(0);
        uint256 amountBet = msg.value;

        MatchResult matchResultBetOn = MatchResult(_resultBetOn);
        
        //update team's total payout
        if (matchResultBetOn == MatchResult.TEAM_A_WON) {
            assetValue = calculateAssetValue(amountBet, matches[_matchId].oddsTeamA);
            matches[_matchId].totalPayoutTeamA = matches[_matchId].totalPayoutTeamA.add(assetValue);
        } else if(matchResultBetOn == MatchResult.TEAM_B_WON) {
            assetValue = calculateAssetValue(amountBet, matches[_matchId].oddsTeamB);
            matches[_matchId].totalPayoutTeamB = matches[_matchId].totalPayoutTeamB.add(assetValue);
        } else {
            assetValue = calculateAssetValue(amountBet, matches[_matchId].oddsDraw);
            matches[_matchId].totalPayoutDraw = matches[_matchId].totalPayoutDraw.add(assetValue);
        }

        //increase totalCollected on the match
        matches[_matchId].totalCollected = matches[_matchId].totalCollected.add(amountBet);

        uint256 smartAssetId = awardSmartAsset(bettor, assetValue, _matchId, matchResultBetOn);
        
        //Save bettor's bet
        matchBets[_matchId][matchResultBetOn].push(smartAssetId);
        
        emit BetPlacedEvent(bettor, _matchId, amountBet, block.timestamp);

        return smartAssetId;
    }


    function awardSmartAsset(address bettor, uint256 assetValue, uint256 _matchId, MatchResult _matchResultBetOn) 
        internal returns (uint256) 
    {
        tokenIds.increment();

        uint256 smartAssetId = tokenIds.current();
        _mint(bettor, smartAssetId);
        
        smartAssets[smartAssetId] = SmartAsset(msg.sender, _matchId, _matchResultBetOn, assetValue, 0);

        emit SmartAssetAwardedEvent(bettor, _matchId, smartAssetId, block.timestamp);

        return smartAssetId;
    }
    
    function startMatch(uint256 _matchId) 
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
    function closeMatch(uint256 _matchId, uint8 _matchResult)
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
        
        
        emit MatchClosedEvent(msg.sender, _matchId, block.timestamp);
    }
    
    function setMatchResult(uint256 _matchId, MatchResult _matchResult) internal {
        matches[_matchId].result = _matchResult;
        emit MatchResultSetEvent(_matchId, matches[_matchId].result, block.timestamp);
    }
    
    function invalidateAssets(uint256[] memory assets) internal {
        for (uint i = 0; i < assets.length; i++) {
            invalidateAsset(assets[i]);
        }
    }

    function invalidateAsset(uint256 _smartAssetId) internal {
        _burn(_smartAssetId);
    }

    /*
    *  @notice  Liquidate smart asset's value
    *  @dev     validated   NFT is burned and caller gets value funds in account
    *  @param   _smartAssetId smart asset id
    *  @return  success status
    */
    function liquidateAsset(uint256 _smartAssetId)
        public 
        payable
        isCircuitBreakOff
        validateToken(_smartAssetId)
        isTokenOwner(_smartAssetId)
        returns(bool)
    {
        SmartAsset memory smartAsset = smartAssets[_smartAssetId];
        
        require(matches[smartAsset.matchId].state == MatchState.FINISHED, "Cannot liquidate asset until match is finished");
        
        // require (bUSDToken.balanceOf(address(this)) >= smartAsset.initialValue, "Contract has insufficient funds");
        require (address(this).balance >= smartAsset.initialValue, "Contract has insufficient funds");
        
        invalidateAsset(_smartAssetId);
        // bUSDToken.transfer(msg.sender, smartAsset.initialValue);
        msg.sender.transfer(smartAsset.initialValue);

        emit AssetLiquidatedEvent(msg.sender, smartAsset.matchId, smartAsset.initialValue, block.timestamp);
        return true;
    }

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
        circuitBreaker = !circuitBreaker;
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
    *  @notice  Fetch single SmartAsset
    *  @dev          
    *  @param   _smartAssetId
    *  @return  asset details
    */
    function getSmartAsset(uint256 _smartAssetId)
        public 
        view
        validateToken(_smartAssetId)
        isTokenOwner(_smartAssetId)
        returns(SmartAsset memory asset)
    {
        return smartAssets[_smartAssetId];
    }

    /*
    *  @notice  Tells of the msg.sender is the admin
    *  @dev
    *  @return  true if msg.sender is admin else false
    */
    function isAdmin() public view returns(bool) {
        return msg.sender == owner;
    }

    /*
    *  @notice  Allows the current owner pass ownership to another address
    *  @dev
    */
    function changeOwner(address newOwner) 
    external 
    onlyOwner {
        owner = newOwner;
    }

    receive() external payable {}
    
}
