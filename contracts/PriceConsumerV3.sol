pragma solidity ^0.7.0;

import "@chainlink/contracts/src/v0.7/interfaces/AggregatorV3Interface.sol";
//import "https://github.com/smartcontractkit/chainlink/blob/develop/evm-contracts/src/v0.7/interfaces/AggregatorV3Interface.sol";

contract PriceConsumerV3 {

    AggregatorV3Interface internal BNB_USD_Feed;
    AggregatorV3Interface internal BUSD_USD_Feed;

    /**
     * Network: BSC Testnet
     * Aggregator: BNB/USD
     * Address: 0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526
     *
     * Aggregator: BUSD/USD
     * Address: 0x9331b55D9830EF609A2aBCfAc0FBCE050A52fdEa
     */
    constructor() public {
        BNB_USD_Feed = AggregatorV3Interface(0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526);
        BUSD_USD_Feed = AggregatorV3Interface(0x9331b55D9830EF609A2aBCfAc0FBCE050A52fdEa);
    }

    /**
     * Returns the latest price BNB vs BUSD
     */
    function getLatestPrice() public view returns (int) {
        (
            uint80 roundID, 
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = BNB_USD_Feed.latestRoundData();

        int busd = (price * getLatestBUSD_USDPrice()) / 10**12; // per 1 BNB (6 decimals)
        return busd;
    }

    function getLatestBUSD_USDPrice() public view returns (int) {
        (
            uint80 roundID, 
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = BUSD_USD_Feed.latestRoundData();

        return (1 * 10**18) / price; // BUSD per 1 USD 
    }
}