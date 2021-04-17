import Web3 from "web3";
import {Biconomy} from "@biconomy/mexa";

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener("load", async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);

        // const biconomy = new Biconomy(window.ethereum, 
        //     {apiKey: process.env.REACT_APP_BICONOMY_KEY_BSC_TESTNET, debug: true});
        // web3 = new Web3(biconomy);

        // biconomy.onEvent(biconomy.READY, () => {
        //   // Initialize your dapp here like getting user accounts etc
        // }).onEvent(biconomy.ERROR, (error, message) => {
        //   // Handle error while initializing mexa
        // });

        try {
          // Request account access if needed
          await window.ethereum.enable();
          // Acccounts now exposed
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        // Use Mist/MetaMask's provider.
        const web3 = window.web3;
        console.log("Injected web3 detected.");
        resolve(web3);
      }
      // Fallback to localhost; use dev console port by default...
      else {
        const provider = new Web3.providers.HttpProvider(
          "http://127.0.0.1:8545"
        );
        const web3 = new Web3(provider);
        console.log("No web3 instance injected, using Local web3.");
        resolve(web3);
      }
    });
  });

export default getWeb3;
