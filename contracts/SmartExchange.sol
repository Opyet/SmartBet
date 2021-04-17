pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "./BEP20.sol";
import "./HelperPancakeSwapROUTER.sol";

/*
* @notice Integrates with Pancakeswap DEX
*/
contract SmartExchange {
    
    address public constant wBNB = 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd; //underlying asset: wBNB
    address public constant BUSD = 0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47; //underlying asset: BUSD
    address public constant pROUTER = 0xD99D1c33F9fC3444f8101754aBC46c52416550D1; // Pancakeswap Router (BSC Testnet)

    BEP20 private wBNBToken;
    BEP20 private bUSDToken;
    HelperPancakeSwapROUTER private router;

    event BalanceEvent(address owner, uint256 balance);

    constructor() {
        wBNBToken = BEP20(wBNB);     // get a handle for the wBNB asset
        bUSDToken = BEP20(BUSD);     // get a handle for the wBNB asset
        router = HelperPancakeSwapROUTER(pROUTER);     // get a handle for the exchange router
    }

    /*
    * @notice swaps BNB to BUSD
    * @param amount amount of BNB to swap to BUSD
    * @param address to deposit the BUSD
    */
    function swap(uint256 amount, address to) public returns (uint[] memory) {
        wBNBToken.deposit{value: amount}(); // deposit native BNB
        wBNBToken.approve(address(router), amount); // allow pancakeswap router to access wBNB

        address[] memory path = new address[](2);
        path[0] = wBNB;
        path[1] = BUSD;
        uint deadline = block.timestamp + 10 minutes; // addition 10 mins

        uint[] memory amountOut = router.swapExactTokensForTokens(amount, 0, path, to, deadline);
        
        uint256 balance = wBNBToken.balanceOf(address(this)); 
        emit BalanceEvent(address(this), balance);
        
        balance = bUSDToken.balanceOf(address(this)); 
        emit BalanceEvent(address(this), balance);

        return amountOut;
    }  

    receive() external payable {}    
}