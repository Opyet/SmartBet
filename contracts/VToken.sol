pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

contract VToken {
    // No implementation, just the function signature. This is just so Solidity can work out how to call it.
    
    /*
    * @notice   The mint function transfers an asset into the protocol, which begins accumulating interest
    * based on the current Supply Rate for The user receives a quantity of vTokens equal to the
    * underlying tokens tokens supplied, divided by the current Exchange Rate.
    * msg.sender: The account which shall supply the asset, and own the minted vTokens.
    * @param    mintAmount The amount of the asset to be supplied, in units of the underlying asset.
    * @return   status 0 on success, otherwise an Error code
    */
    function mint(uint mintAmount) public returns (uint) {}
    
    /*
    * @notice   The redeem underlying function converts vTokens into a specified quantity of the underlying asset, 
    * and returns them to the user. The amount of vTokens redeemed is equal to the quantity of underlying tokens received, 
    * divided by the current Exchange Rate. The amount redeemed must be less than the user's Account Liquidity 
    * and the market's available liquidity.
    * msg.sender: The account to which redeemed funds shall be transferred.
    * @param    redeemAmount The amount of underlying to be redeemed.
    * @return   status 0 on success, otherwise an Error code
    */
    function redeemUnderlying(uint redeemAmount) public returns (uint) {}
    
    /*
    * @notice   The user's underlying balance, representing their assets in the protocol,
    * is equal to the user's vToken balance multiplied by the Exchange Rate.
    * @param    account The account to get the underlying balance of.
    * @return   The amount of underlying currently owned by the account.
    */
    function balanceOfUnderlying(address account) public returns (uint) {}
    
    
    // function exchangeRateCurrent() returns (uint) {}
    //exchangeRate = (getCash() + totalBorrows() - totalReserves()) / totalSupply()
}