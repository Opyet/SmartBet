pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "./Bep20.sol";

//TODO: move to HelperPancakeSwap_ROUTER.sol
contract HelperPancakeSwap_ROUTER {
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


/*
* @notice Integrates with Pancakeswap DEX
*/
contract SmartExchange {
    
    address public constant wBNB = 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd; //underlying asset: BUSD
    address public constant BUSD = 0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47; //underlying asset: BUSD
    address public constant pROUTER = 0xD99D1c33F9fC3444f8101754aBC46c52416550D1; // Pancakeswap Router (BSC Testnet)
    //address public constant pFACTORY = 0x6725F303b657a9451d8BA641348b6761A6CC7a17; // Pancakeswap factory (BSC Testnet)
    
   function swap(uint256 amount, address to) public returns (uint[] memory) {
        
        HelperPancakeSwap_ROUTER router = HelperPancakeSwap_ROUTER(pROUTER);     // get a handle for the exchange router
        Bep20 busdContract = Bep20(BUSD);     // get a handle for the BUSD asset
        Bep20 wbnbContract = Bep20(wBNB);     // get a handle for the wBNB asset
        
        wbnbContract.deposit{value: amount}(); // deposit native BNB
        
        wbnbContract.approve(address(router), 0); // security: reset allowance
        wbnbContract.approve(address(router), amount); // allow pancakeswap router to access wBNB

        uint256 amountIn = amount;
        uint256 amountOutMin = 0;
        address[] memory path = new address[](2);
        path[0] = address(wbnbContract);
        path[1] = address(busdContract);
        address to = to;
        uint deadline = block.timestamp + 10 minutes; // addition 10 mins

        uint[] memory amountOut = router.swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline);
        
        // assert(amountOut > 0, "swapping failed with returning 0");

        return amountOut;
    }      
}