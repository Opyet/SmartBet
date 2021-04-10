import React, {Component, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Match from "./UpcomingMatchCard";
import Preloader from "../layout/Preloader";
import APICall from "../../utils/APICall";

class Upcoming extends Component {
  constructor(props){
    super(props);
    this.state={
      web3: null, 
      account: null, 
      contract: null,
      matches: []
    }

    this.getMatches();
  }

  componentWillMount() {
    if(this.props.baseAppState){
      this.setState({contract: this.props.baseAppState.contract});
      this.setState({account: this.props.baseAppState.accounts[0]});
    }
  }
  
  getMatches = () => {
    APICall('fixtures/date/2020-02-06?timezone=Europe/London')
    .then(result => {
      console.log(result);
    })
    .catch(error => {

    });
  }

  render() {
    if (this.state.loading || this.state.matches === null) {
      return <Preloader />;
    }
  
    return (
      <div className={"page-wraper"}>
        <Grid container spacing={3}>
          {!this.state.loading && this.state.matches.length === 0 ? (
            <p className="center">No Matches to show....</p>
          ) : (
            this.state.matches.map((match, index) =>
              match.opponents.length == 2 ? (
                <Grid key={index} item xs={12} sm={6}>
                  <Paper elevation={2} className="match-paper" >
                    <Match match={match} />
                  </Paper>
                </Grid>
              ) : (
                <React.Fragment key={index}></React.Fragment>
              )
            )
          )}
        </Grid>
      </div>
    );
  }
}

export default Upcoming;
