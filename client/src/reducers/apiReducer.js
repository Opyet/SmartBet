import {GET_MATCHES,SET_LOADING,MATCHES_ERROR} from '../actions/types';
const initialState={
    matches:null,
    current:null,
    loading:false,
    error:null
};

export default(state=initialState,action)=>{
    switch(action.type){
        case GET_MATCHES:
            return {
                ...state,
                matches:action.payload,
                loading:false
            };
        case SET_LOADING:
            return {
                ...state,
                loading:true
            };
        case MATCHES_ERROR:
            console.error(action.payload);
            return{
                ...state,
                error:action.payload
            }
        default:
            return state;
    }
}