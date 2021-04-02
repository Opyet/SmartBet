import { CONNECT_WEB3, LOAD_CONTRACT, CLEAR_NETWORK } from "../actions/types";

const INITIAL_STATE = {
  web3: null,
  account: null,
  contract: null,
  network: null,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case CONNECT_WEB3:
      return {
        ...state,
        ...action.payload,
      };
    case LOAD_CONTRACT:
      return {
        ...state,
        contract: action.payload,
      };
    case CLEAR_NETWORK:
      return {
        ...state,
        network: null,
      };
    default:
      return state;
  }
};
