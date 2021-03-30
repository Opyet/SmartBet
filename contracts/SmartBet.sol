pragma solidity ^0.8.0;

//import SafeMath (if not already inherited)
//import erc1155

/*
 * @notice SmartBet core smart contract. Handles matches, bets and farming
 */
contract SmartBet {


    ////////////////////////////////////////
    //                                    //
    //         STATE VARIABLES            //
    //                                    //      
    ////////////////////////////////////////
    // contract owner adress
    address private owner;

    // incremented id for matches
    uint256 private uid;

    // incremented id for NFT minting
    uint256 private uTokenId;

    enum MatchState {NOT_STARTED, STARTED, FINISHED };


    struct Match {
        address creator;

    }

    // NFT issued to winner
    struct SmartAsset {
        uint256 tokenId;
        address owner;
        uint256 value;
    }

    // holds all NFTs issued to winners
    mapping(address => SmartAsset[]) assets;


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

    event LogMatchAdded(address indexed creator, uint128 matchId);
    event LogBetAdded(address indexed bettor, uint128 indexed matchId, uint256 amount);
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
    *  @notice  New match creation
    *  @dev   
    *  @param  
    *  @return  success success status
    */
    function placeBet(uint128 _matchId)
        public 
        matchExists(_matchId) 
        matchNotStarted(_matchId) 
        returns(bool success)
    {
        //code

        emit LogBetAdded(bettor, matchId, amount);
    }


    /*
    *  @notice  Match manual close by admin
    *  @dev   
    *  @param  
    *  @return  success success status
    */
    function closeMatch(uint128 _matchId)
        public 
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
        matchExists(_matchId) 
        matchStarted(_matchId) 
        returns(bool success)
    {
        //code

        emit LogWithdrawal(by, matchId, amount);
    }


    /*
    *  @notice  Fetch daily matches
    *  @dev         
    *  @return  matches An array of all matches created for today
    */
    function getMatchesToday()
        public 
        view
        returns(uint128[] matches)
    {
        //code
        
        
    }

    /*
    *  @notice  Fetch daily bets of caller
    *  @dev         
    *  @return  matches An array of all bets placed for today
    */
    function getBetsToday()
        public 
        view
        returns(uint128[] bets)
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
        returns(SmartAsset asset)
    {
        //code        
        
    }
    
}