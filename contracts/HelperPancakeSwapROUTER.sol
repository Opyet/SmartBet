pragma solidity ^0.7.0;

contract HelperPancakeSwapROUTER {
    // No implementation, just the function signature. This is just so Solidity can work out how to call it.
    
    /*
    * @notice   Swaps an exact amount of input tokens for as many output tokens as possible, 
    *           along the route determined by the path. The first element of path is the input token, 
    *           the last is the output token, and any intermediate elements represent intermediate pairs
    *           to trade through (if, for example, a direct pair does not exist).
    *           ``msg.sender`` should have already given the router an allowance of at least amountIn on the input token.
    * @param    amountIn    The amount of input tokens to send.
    * @param    amountOutMin    The minimum amount of output tokens that must be received for the transaction not to revert.
    * @param    path    An array of token addresses. ``path.length`` must be >= 2. Pools for each consecutive pair of addresses must exist and have liquidity.
    * @param    to      Recipient of the output tokens.
    * @param    deadline    	Unix timestamp after which the transaction will revert.
    * @return    amounts    	The input token amount and all subsequent output token amounts.
    */
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts) {}
    

    /*
    * @notice   Same as 
    *           Succeeds for tokens that take a fee on transfer.* and the market's available liquidity.
    *           ``msg.sender`` should have already given the router an allowance of at least amountIn on the input token.
    * @param    redeemAmount The amount of underlying to be redeemed.
    * @return   status 0 on success, otherwise an Error code
    */
    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external {}
    
}