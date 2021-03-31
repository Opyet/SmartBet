pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.7/ChainlinkClient.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol"

/*
 * @notice SmartBet core smart contract. Handles matches, bets and farming
 */
contract SmartBet is ERC721, ChainlinkClient {

    using Counters for Counters.Counter;
    //using SafeMath for uint256;

    ////////////////////////////////////////
    //                                    //
    //         STATE VARIABLES            //
    //                                    //      
    ////////////////////////////////////////
    // contract owner adress
    address private owner;

    // incremented for match id generation
    uint256 private idCounter;

    // incremented id for NFT minting
    Counters.Counter private uTokenIds;

    // total funds available
    uint256 public totalTreasury;

    // flag to determine if contracts core functionalities can be performed
    bool circuitBreaker = false;

    enum MatchState {NOT_STARTED, STARTED, FINISHED };

    uint8 private constant TEAM_A = 0;
    uint8 private constant TEAM_B = 1;

    struct Match {
        address creator;
        uint256 sportApiMatchId;
        uint256 totalPayoutTeamA;
        uint256 totalPayoutTeamB;
        uint256 totalCollected;
        MatchState status;
    }

    // NFT issued to winner
    struct SmartAsset {
        uint256 tokenId;
        address owner;
        uint256 initialValue;
        uint8 accruedInterest;
    }

    //struct Bet {
    //    address better;
    //    uint256 amount;
    //}

    // holds all NFTs issued to winners
    mapping(address => SmartAsset[]) assets;

    // holds all created matches (key: idCounter)
    mapping(uint256 => Match) matches;

    // holds all bets on a match
    // mapping(matchId => mapping(team => mapping(address => amount[]))) matchBets;
    mapping(uint256 => mapping(uint8 => mapping(address => uint256[]))) matchBets;


    ////////////////////////////////////////
    //                                    //
    //           CONSTRUCTOR              //
    //                                    //      
    ////////////////////////////////////////

    constructor() public {
        owner = msg.sender;
    }

    
    ////////////////////////////////////////
    //                                    //
    //         CALLBACK FUNCTIONS         //
    //                                    //      
    ////////////////////////////////////////

    /*
    *  @notice  Set Match results
    *  @dev   
    *  @param  
    *  @return  success success status
    */
    function setResult(uint128 _matchId)
        public 
        matchExists(_matchId) 
        matchFinished(_matchId) 
        returns(bool success)
    {
        //code

        emit LogSetResult(matchId, winner); //winner should be 0(for team A) or 1 (team B)
    }




    ////////////////////////////////////////
    //                                    //
    //              EVENTS                //
    //                                    //      
    ////////////////////////////////////////

    //Can be used by the clients to get all matches in a particular time
    event LogMatchAdded(address indexed creator, uint128 matchId, uint256 indexed startAt);
    //Can be used by the clients to get all bets placed by a better in a particular time
    event LogBetAdded(address indexed bettor, uint128 indexed matchId, uint256 amount, uint256 indexed betAt);
    event LogCloseMatch(address indexed by, uint128 indexed matchId);
    event LogSetResult(uint128 indexed matchId, uint8 winner);
    event LogWithdrawal(address indexed by, uint128 indexed matchId, uint256 amount);





    ////////////////////////////////////////
    //                                    //
    //              MODIFIERS             //
    //                                    //      
    ////////////////////////////////////////

    /*
    *  @notice  Restrict caller only owner
    */
    modifier onlyOwner(){
        
    }

    /*
    *  @notice  Ensure match does not previously exist
    */
    modifier isNewMatch(_matchId){

    }

    /*
    *  @notice  Ensure match exists
    */
    modifier matchExists(_matchId){
        
    }

    /*
    *  @notice  Ensure match has not started
    */
    modifier matchNotStarted(_matchId){
        
    }

    /*
    *  @notice  Ensure match has started
    */
    modifier matchStarted(_matchId){
        
    }

    /*
    *  @notice  Ensure match has ended
    */
    modifier matchFinished(_matchId){
        
    }

    /*
    *  @notice Checks if core functionalities can be performed
    *  @dev Checks if the circuitBreaker state variable is false
    */
    modifier isCircuitBreakOff() {

    }

    /*
    *  @notice Checks if the NFT is valid
    *  @dev Validates NFT
    */
    modifier validateNFT(_tokenId) {

    }
    
    /*
    *  @notice  Ensure token belongs to the caller
    */
    modifier isAssetOwner(_tokenId) {

    }

    /*
    *  @notice  Ensures bets are allowed on the match
    *  @dev     The totalCollected on the match must be greater than the total payout on the team the bettor wants to bet on. The incoming bet is inclusive in the calculation
    */
    modifier isBetAllowed(_matchId) {
        
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
    function toggle()
        public 
        onlyOwner 
        returns(bool success)
    {
        //code

    }
    
    
    /*
    *  @notice  New match creation
    *  @dev     
    *  @param   
    *  @return  success success status
    */
    function createMatch()
        public 
        onlyOwner 
        isNewMatch(_matchId) 
        returns(bool success)
    {
        //code

        emit LogMatchAdded(creator, matchId);
    }


    /*
    *  @notice  New bet creation. Mint NFT to bettor
    *  @dev   
    *  @param  
    *  @return  success success status
    */
    function placeBet(uint128 _matchId)
        public 
        payable
        matchExists(_matchId) 
        matchNotStarted(_matchId) 
        isBetAllowed(_matchId)
        returns(bool success)
    {
        //code

        emit LogBetAdded(bettor, matchId, amount);
    }


    /*
    *  @notice  Match manual close by admin. Trigger "getResult()" 
    *  @dev   
    *  @param  
    *  @return  success success status
    */
    function closeMatch(uint128 _matchId)
        public 
        onlyOwner
        matchExists(_matchId) 
        matchStarted(_matchId) 
        returns(bool success)
    {
        //code

        emit LogCloseMatch(by, matchId);
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
        validateNFT(_tokenId)
        matchExists(_matchId) 
        matchStarted(_matchId) 
        returns(bool success)
    {
        //code

        emit LogWithdrawal(by, matchId, amount);
    }


    /*
    *  @notice  Fetch match result with a call through ChainlinkClient.
    *  @dev     ChainlinkClient Oracle. Callback function "setResult()"
    *  @oaram   _matchId
    *  @return match match details
    */
    function getResult(_matchId)
        public 
        view
        matchFinished(_matchId)
        returns(Match match)
    {
        //code        
        
    }


    /*
    *  @notice  Fetch match details
    *  @dev         
    *  @oaram   _matchId
    *  @return match match details
    */
    function getMatch(_matchId)
        public 
        view
        returns(Match match)
    {
        //code        
        
    }

    
    /*
    *  @notice  Fetch all NFTs (SmartAssets)
    *  @dev             
    *  @return  assets Array of all NFTs
    */
    function allSmartAssets()
        public 
        view
        returns(SmartAsset[] assets)
    {
        //code        
        
    }


    /*
    *  @notice  Fetch single NFT (SmartAsset)
    *  @dev          
    *  @param   _tokenId
    *  @return  asset NFT details
    */
    function getSmartAsset(_tokenId)
        public 
        view
        isAssetOwner(_tokenId)
        returns(SmartAsset asset)
    {
        //code        
        
    }
    
}
