# SmartBet


[Project Image](project-image-url)

> A decentralized betting and farming platform

---

## Table of Contents

- [Description](#description)
- [User Story](#user-story)
- [Integrations](#integrations)
- [Advantages](#Advantages)
- [How To Use](#how-to-use)
- [Installation](#installation)
- [References](#references)
- [Contributions](#contributions)
- [License](#license)


---

## Description

SmartBet is a betting platform that allows users to place bets using cryptocurrency. It also provides incentives as interests to winners who decide to keep their wins on the platform. These reserved funds are traded with by the platform on a DeFi lending protocol. When users place bets on matches using native coin(BNB) which is swapped for stablecoins (BUSD), they are issued NFTs (ERC721) which serve as both the value of their bets as well as keep track of all accrued interests. Users can liquidate their wins at will.

Kindly read the documentation [here.](https://smartbet.gitbook.io/smartbet/)

---
## User Story

A bettor comes to the platform to place 100BUSD bet on a match whose odds is 4/1. He will be issued an NFT that represents his bet. If this bet wins, his NFT will remain valid and valued at `4 * 100BUSD = 400BUSD`. He can then decide to withdraw immediately or defer his withdraw till a later time. If he keeps his funds in the SmartBet platform, they will be traded with on a lending protocol and the user will receive dividends of the investment when withdrawals are made.

---
## Integrations

- PancakeSwap: Decentralized Exchange platform for swapping user funds into BUSD stablecoins.
- 1Inch: DEX Aggregator for swapping user asset to BUSDs for voting.
- Metamask Wallet: User wallet
- [Venus](https://github.com/VenusProtocol/venus-protocol): Farming/Lending Protocol for BUSD stablecoins
- [Biconomy](https://docs.biconomy.io/): Gasless transactions and better user experience. Also serves as incentive in user onboarding
- [RapidAPI](https://rapidapi.com/api-sports/api/api-football) - Live data for matches, odds and margins
- Chainlink - Sport Oracles for live scores (available for mainnet deployment).

---
## Advantages

- Anonymous betting
- User-centered design
- Gasless transactions for early adopters
- Quick cashout at will
- Bettors can earn more funds by supplying BUSD liquidity in the pool. Liquidity providers all get 60% of the interest.
- No auto-liquidation: Limitless incentives for NFT holding bettors.

---
## How To Use
### User
- Visits the app
- Connects your wallet to the app
- View upcoming games/matches created
- Place bet on a match
- View your slips (NFT) and its value in BUSD
- Withdraw payout on each slip(NFT) after the match ends

### Admin
- Visit the app
- Create an upcoming match, set it's odds and start time

---
## Installation

### Smart Contracts
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
---
### Client
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
## Contributions

- Opeyemi Olabode: Blockchain and Frontend
- Damilola Ajiboye: Blockchain
- Idris Musa Usman: Product Development and Documentation
- Patrick Asu: Product Development and Frontend 
- Mekuleyi Michael: Product Development
- Oyemade Hezekiah: Product Development
- Ponsakorn Thammathanik: Project Management

[Back To The Top](#SmartBet)

---

## License

The MIT License (MIT)

Copyright (c) 2021 SmartBet

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
