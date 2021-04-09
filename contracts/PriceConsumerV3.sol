pragma solidity ^0.7.0;

import "@chainlink/contracts/src/v0.7/interfaces/AggregatorV3Interface.sol";

contract PriceConsumerV3 {

    AggregatorV3Interface internal priceFeed;

    /**
     * Network: BSC Testnet
     * Aggregator: BNB/DAI
     * Address: 0x0630521aC362bc7A19a4eE44b57cE72Ea34AD01c
     */
    constructor() public {
        priceFeed = AggregatorV3Interface(0x0630521aC362bc7A19a4eE44b57cE72Ea34AD01c);
    }

    /**
     * Returns the latest price
     */
    function getLatestPrice() public view returns (int) {
        (
            uint80 roundID, 
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return price;
    }
}