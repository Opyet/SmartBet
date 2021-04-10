# SmartBet


![Project Image](project-image-url)

> A decentralized betting and farming platform

---

### Table of Contents

- [Description](#description)
- [How To Use](#how-to-use)
- [Common Attacks Avoided](#common-attacks-avoided)
- [Design Patterns](#design-patterns)
- [References](#references)
- [Contributors](#contributors)
- [License](#license)


---

## Description

SmartBet is a betting platform that besically allow users to place bets using crypto, and provide incentives as interests to winners who decide to keep their funds in the platform. These reserved funds are traded with by the platform on a DeFi lending protocol.
When users place bets on live matches using exchanged stablecoins (BUSD), they are issues NFTs (ERC721) which both serve as the value of their bets as well as keep track of all accrued interests.
Users can withdraw at will.

Kindly read the FULL DOCUMENTATION ![gitbook](https://app.gitbook.com/@bamuska/s/smartbet/~/drafts/-MXwAr9vdUUtvHzM3PJ7/)

### User Story

A bettor comes to the platform to place 100BUSD bet on a match whose odds is 4/1. He will be issued an NFT that represents his bet. If this bet wins, his NFT will remain valid and valued at `4 * 100BUSD = 400BUSD`. He can then decide to withdraw immediately or defer his withdraw till a later time. If he keeps his funds in the SmartBet platform, they will be traded with on a lending protocol and the user will receive dividends of the investment when withdrawals are made.

### Betting Odds and Probability

Betting odds represent the probability of an event to happen and therefore enable you to work out how much money you will win if your bet wins. As an example, with the odds of `4/1`, for every £1 you bet, you will win £4. There is a 20% chance of this happening, calculated by `1 / (4 + 1) = 1/5 = 0.20`.

Calculating the probability of staker winning and/or platform losing money:
`% = den / (den + num)`


### Integrations

- PancakeSwap: Decentralized Exchange platform for swapping user funds into BUSD stablecoins.
- Metamask Wallet: User wallet
- ![Venus](https://github.com/VenusProtocol/venus-protocol): Farming/Lending Aggregator for BUSD stablecoins
- ![Biconomy](https://docs.biconomy.io/): Gasless transactions and better user experience. Also serves as incentive in user onboarding
- ![RapidAPI](https://rapidapi.com/api-sports/api/api-football) - Live data for matches, odds and margins
- Chainlink - Sport Oracles for live scores (available for mainnet deployment).

### Advantages

- Anonymous betting
- User-centered design
- Gasless transactions for early adopters
- Quick cashout at will
- Bettors can earn more funds by supplying BUSD liquidity in the pool. Liquidity providers all get 60% of the interest.
- No auto-liquidation: Limitless incentives for NFT holding bettors.

### Key Calculations 

#### Safe Bet
Smart Contract ensures that bets can only be placed when there's enough funds to pay out for that bet winning.

`TotalPayOut_TeamA/B/Draw = TotalPayOut_TeamA/B/Draw + (betAmount * odds)`

`Match_TotalCollectedFunds > TotalPayOut_TeamA/B/Draw`

#### Investment Returns

Team share = 10% of InvestmentReturn
Back to Reserve = 30% of InvestmentReturn
Farmers' share = 60% of InvestmentReturn

`Incentive (Bettor RoI) = (initialValue / totalReserveOfPreviousCycle) * farmersShare`

`Accrued Interest = (incentive / initialValue) * 100`

`BettorNFTValue = initialValue + ((accruedInterest / 100) * initialValue)`

[Back To The Top](#SmartBet)

---

## How To Use

- Useer opens the app
- There is a prompt to connect user wallet to the app
- User can view upcoming games/matches admin ha created
- User can select a game to be on
- User can view his/her slips (NFT) and its value in BUSD
- User can withdraw payout on each slip(NFT)

### Installation

#### SMART CONTRACTS
At the project folder root,

Install Dependencies
> `> npm install`

Compile contracts
> `> truffle compile`

Run tests
> `> truffle test`

Deploy on BSC Testnet
> `> truffle migrate --network bsc_testnet`

Deploy on local network (ganache-cli)
> `> ganache-cli`
> `> truffle migrate --network ganache`


#### FRONTEND
At the project folder root,

Navigate into the `client` folder
> `> cd client`

Install Dependencies
> `> npm install`

To Build React App
> `> npm run build`

To Start App on Development Server
> `> npm run start`



[Back To The Top](#SmartBet)

---

## Common Attacks Avoided



[Back To The Top](#SmartBet)

---

## Design Patterns



[Back To The Top](#SmartBet)

---

## References

1. Betting dApps on BSC
https://blink.wink.org/blink.pdf
https://hobbit.finance/
https://rocketgame.vip/

2. Odds Calculations and Probabilities
https://www.investopedia.com/articles/dictionary/042215/understand-math-behind-betting-odds-gambling.asp
https://learn.problemgambling.ca/probability-odds-random-chance#:~:text=To%20convert%20odds%20to%20probability,1%2F5%20or%2020%25.
https://mybettingsites.co.uk/learn/betting-odds-explained/#:~:text=In%20Summary,4%20%2B%201)%20%3D%200.20.

3. Livescores API
Fixtures by ID: https://rapidapi.com/api-sports/api/api-football?endpoint=apiendpoint_9e5959e2-9609-4fe9-98de-91574b894ff7
Upcoming games By Date (Filter by timestamp to get match status):
https://rapidapi.com/api-sports/api/api-football?endpoint=apiendpoint_5c14c3d5-6bbd-46be-a7c4-cf01ec58372e




[Back To The Top](#SmartBet)

---

## Contributors

- Opeyemi Olabode: Team Lead
- Damilola: Smart Contract
- Idris Musa Usman: Documentation
- Patrick Asu: Frontend
- Mekuleyi Michael
- Oyemade

[Back To The Top](#SmartBet)

----

## License

The MIT License (MIT)

Copyright (c) 2018 Truffle

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

[Back To The Top](#SmartBet)

---