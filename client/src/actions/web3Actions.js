import Web3 from "web3";
import Portis from "@portis/web3";
import ArenaJson from "../contracts/Arena.json";
import history from "../history";
import { CONNECT_WEB3, LOAD_CONTRACT, CLEAR_NETWORK } from "./types";

export const connectWeb3 = (id) => async (dispatch) => {
  let web3;

  dispatch({
    type: CLEAR_NETWORK,
  });

  if (id === -1) {
    id = parseInt(window.localStorage.getItem("WALLET_ID"));
    if (!id) {
      id = 1;
    }
  }

  console.log(id);

  if (id === 1) {
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      web3 = window.web3;
    }
    window.localStorage.setItem("WALLET_ID", 1);
  } else if (id === 2) {
    const portis = new Portis(
      "f939d736-cdc5-490f-be4a-dcf2a4bd8bfa",
      "maticMumbai"
    );
    web3 = new Web3(portis.provider);
    window.localStorage.setItem("WALLET_ID", 2);
  } else if (id === 3) {
    const portis = new Portis("f939d736-cdc5-490f-be4a-dcf2a4bd8bfa", "kovan");
    web3 = new Web3(portis.provider);
    window.localStorage.setItem("WALLET_ID", 3);
  }

  const accounts = await web3.eth.getAccounts();
  const ethId = await web3.eth.net.getId();

  window.ethereum.on("chainChanged", (_) => window.location.reload());
  window.ethereum.on("accountsChanged", (_) => window.location.reload());

  dispatch({
    type: CONNECT_WEB3,
    payload: {
      web3,
      account: accounts[0],
      network: ethId,
    },
  });

  if (
    ethId !== 42 &&
    ethId !== 80001 &&
    history.location.pathname !== "/warning"
  ) {
    history.push("/warning");
  }

  dispatch(loadContract());
};

const loadContract = () => async (dispatch, getState) => {
  const web3 = getState().ethereum.web3;
  const id = await web3.eth.net.getId();

  if (id !== 42 && id !== 80001) return;

  const contract = new web3.eth.Contract(
    ArenaJson.abi,
    ArenaJson.networks[id].address
  );

  dispatch({
    type: LOAD_CONTRACT,
    payload: contract,
  });
};
