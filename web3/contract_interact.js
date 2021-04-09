let fs = require('fs');
let Web3 = require('web3');

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://127.0.0.1:7545'));

let contractAddress = "0xd7d591c21b6Dd51122c52c6B36bB6b51adF43140";
let fromAddress = "0x8aa2e38490DeC6E673aBdB6704d202aE50eDB067";

let abiStr = fs.readFileSync('../build/contracts/SmartBet.json', 'utf8');
let abi = JSON.parse(abiStr).abi;
console.log(abi.length);

let smartBet = new web3.eth.Contract(abi, contractAddress);

sendTransactions()
    .then(function() {
        console.log("Done");
    })
    .catch(function(error) {
        console.log(error);
    });

async function sendTransactions() {
    console.log("Creating match");
    let latestTimestamp = web3.eth.getBlock("latest").timestamp;
    let match = await smartBet.methods.getMatch(0).call();
    console.log(match);
    // await smartBet.methods.createMatch("hello", 1, 2, latestTimestamp).send({from: fromAddress});
}