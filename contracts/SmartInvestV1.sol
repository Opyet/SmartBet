pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "./BEP20.sol";
import "./VToken.sol";

/*
* @notice Integrates with Venus lending protocol
*/
contract SmartInvestV1 {
    
    uint256 public totalTreasury;
    address public constant vTOKEN_ADDRESS = 0x08e0A5575De71037aE36AbfAfb516595fE68e5e4; // BSC testnet Venus vTokens (vBUSD)
    address public constant BASE_BEP20 = 0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47; //underlying asset: BUSD
    
    function invest(uint256 amount) public {
        
        BEP20 underlying = BEP20(BASE_BEP20);     // get a handle for the underlying asset
        VToken vToken = VToken(vTOKEN_ADDRESS);   // get a handle for the corresponding vToken Contract
        underlying.approve(address(vToken), 0);     // security: reset allowance
        underlying.approve(address(vToken), amount); // approve the transfer
        assert(vToken.mint(amount) == 0);            // mint the vTokens and assert there is no error
    }
    
    function redeem(uint256 amount) public {
        VToken vToken = VToken(vTOKEN_ADDRESS);
        require(vToken.redeemUnderlying(amount) == 0, "something went wrong");
    }
    
    function getBalance() public returns (uint256){
        VToken vToken = VToken(vTOKEN_ADDRESS);
        uint tokens = vToken.balanceOfUnderlying(msg.sender);
        return tokens;
    }
    
    // function exchangeRateCurrent() public {
    //     VBep20 vToken = VToken(vTOKEN_ADDRESS);
    //     uint exchangeRateMantissa = vToken.exchangeRateCurrent();
    // }
    
}


// const vTokenDecimals = 8; // all vTokens have 8 decimal places
// const underlying = new web3.eth.Contract(bep20Abi, busdAddress);
// const vToken = new web3.eth.Contract(vTokenAbi, vBusdAddress);
// const underlyingDecimals = await underlying.methods.decimals().call();
// const exchangeRateCurrent = await vToken.methods.exchangeRateCurrent().call();
// const mantissa = 18 + parseInt(underlyingDecimals) - vTokenDecimals;
// const onevTokenInUnderlying = exchangeRateCurrent / Math.pow(10, mantissa);
// console.log('1 vBUSD can be redeemed for', oneVTokenInUnderlying, 'BUSD');