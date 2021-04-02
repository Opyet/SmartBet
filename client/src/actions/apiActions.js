import { GET_MATCHES, SET_LOADING, MATCHES_ERROR } from "./types";
import dataApi from "../api";

export const getMatches = () => async (dispatch) => {
  try {
    setLoading();
    const res = await dataApi.get("/upcoming");
    dispatch({
      type: GET_MATCHES,
      payload: res.data,
    });
  } catch (err) {
    alert(err);
  }
};

//set loading to true
export const setLoading = () => {
  return {
    type: SET_LOADING,
  };
};

//export default getMatches;
