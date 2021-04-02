import _ from "lodash";
import {
  MATCHES_LOADING,
  GET_CONTRACT_MATCHES,
  GET_CONTRACT_MATCH,
} from "../actions/types";

const INITIAL_STATE = {
  matches: [],
  loading: true,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case GET_CONTRACT_MATCH:
      return {
        ...state,
        [action.payload.id]: action.payload,
        loading: false,
      };
    case GET_CONTRACT_MATCHES:
      return { ...state, matches: action.payload, loading: false };
    case MATCHES_LOADING:
      return {
        ...state,
        loading: true,
      };
    default:
      return state;
  }
};
