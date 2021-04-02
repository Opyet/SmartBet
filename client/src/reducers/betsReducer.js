import { GET_BETS } from "../actions/types";

const INITIAL_STATE = {
  betsA: [],
  betsB: [],
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case GET_BETS:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};
