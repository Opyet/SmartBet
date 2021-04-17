import React, {Component, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Match from "./UpcomingMatchCard";
import Preloader from "../layout/Preloader";
import APICall from "../../utils/APICall";

class Upcoming extends Component {
  constructor(props){
    // const fs = require('fs');
    super(props);
    this.state={
      web3: null, 
      account: null, 
      contract: null,
      matches: []
      //this.fs.readFileSync("sampleUpcoming.json").toString().trim()['api']['fixtures']
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
    let date = new Date(); //2020-02-06
    let today = date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, "0") + '-' + date.getDate().toString().padStart(2, "0");    
    
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; //'Europe/London';
    
    // use already stored fixtures
    // const matches = localStorage.getItem('upcoming');
    // if(matches){
    //   let matchesJSON = JSON.parse(matches);
    //   this.setState({matches: matches});
    //   return;
    // }

    // gets fixtures for the following day.
    APICall(`fixtures/date/${today}?timezone=${timezone}`)
    .then(result => {
      if(result.api.results > 0){
        let fixtures = result.api.fixtures;
        this.setState({matches: fixtures});
        let strMatches = JSON.stringify(fixtures);
        // localStorage.setItem('upcoming', strMatches);
      }
    })
    .catch(error => {
      console.log('getMatches: ', error);
    });
  }

  render() {
    if (!this.state.contract || this.state.loading || this.state.matches === null) {
      return <Preloader />;
    }

    let countries = ['World', 'England', 'Spain', 'Nigeria'];
    let leagues = ['Ligue 1', 'Serie A', 'Bundesliga 1'];
  
    return (
      <div className={"page-wraper"}>
        <Grid container spacing={3}>
          {!this.state.loading && this.state.matches.length === 0 ? (
            <p className="center">No Matches to show....</p>
          ) : (
            this.state.matches.map((match, index) =>              
              match.statusShort !== 'NS' && (
                leagues.includes(match.league.name) || countries.includes(match.league.country)) ? (
                <Grid key={index} item xs={12} sm={6}>
                  <Paper elevation={2} className="match-paper" >
                    <Match match={match} contract={this.state.contract} account={this.state.account} />
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
