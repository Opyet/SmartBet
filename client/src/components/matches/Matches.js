import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import MatchCard from "./MatchCard";
import Preloader from "../layout/Preloader";
import React, { Component } from 'react';



class Matches extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: null, 
      account: null, 
      contract: null,
      matches: [],
      loading: false
    }
  }

  componentWillMount() {
    if(this.props.baseAppState){
      this.setState({contract: this.props.baseAppState.contract});
      this.setState({account: this.props.baseAppState.accounts[0]});
    }
  }

  componentDidMount() {
    this.getContractMatches();
  }

  
  componentWillUnmount() {

  }

  getContractMatches =()=>{
    
  }

  render() {
    if (this.state.loading) {
      return <Preloader />;
    }
  
    return (
      <div className={"page-wrapper"}>
        <Grid container spacing={3}>
          {this.state.matches.length === 0 ? (
            <p className="center">No Current Matches to show....</p>
          ) : (
            this.state.matches.map((match, index) => (
              <Grid key={index} item xs={12} sm={6}>
                <Paper className={"match-paper"} elevation={2}>
                  <MatchCard match={match} />
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
      </div>
    );
  }
}

export default Matches;