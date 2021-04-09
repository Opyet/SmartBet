let fs = require('fs');
let Web3 = require('web3');

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://127.0.0.1:7545'));

let contractAddress = "0xcfe8f79f7fF5EECCe213627bA9D1c128Cd851B7D";
let fromAddress = "0xFCc805860BFC6444cf86AE26ec20E1786071C861";

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
    let latestBlock = await web3.eth.getBlock("latest")
    let latestTimestamp = latestBlock.timestamp;
    console.log(latestTimestamp);
    
    await smartBet.methods.createMatch("1", "hello", "1", "2", "1617651875").send({from: fromAddress});

    let match = await smartBet.methods.getMatch(0).call();
    console.log(match);
}