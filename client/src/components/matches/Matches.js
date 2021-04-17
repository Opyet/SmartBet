import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import MatchCard from "./MatchCard";
import Preloader from "../layout/Preloader";
import React, { Component } from 'react';
import CalendarToday from "@material-ui/icons/CalendarToday";
import APICall from '../../utils/APICall';


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
    let now = Date.now() / 1000;
    let today = now - (now % 86400);

    this.state.contract.getPastEvents('MatchCreatedEvent', {
      filter: {createdOn: today},  
      fromBlock: 0,
      toBlock: 'latest'
      }, (error, events) => {       
        if(!error && events && events.length > 0){
          let contractMatches = [];
          events.forEach(event => {
            let apiMatchId = event.returnValues.apiMatchId;

            //TODO: get match details
            let url = `fixtures/id/${apiMatchId}`;
            APICall(url).then(result=>{
              console.log('match details', result);
              if(result){
                let match = result.api.fixtures[0];
                match.creator = event.returnValues.creator;
                match.matchId = event.returnValues.matchId;
                match.oddsA = event.returnValues.oddsA;
                match.oddsB = event.returnValues.oddsB;
                match.oddsDraw = event.returnValues.oddsDraw;

                this.state.contract.methods.getMatch(match.matchId).call({from: this.state.account})
                .then(contractMatch => {
                  if(contractMatch){
                    console.log(contractMatch);
                    match.state = contractMatch.state;
                    if(match.state === 1){
                      match.started = true;
                    }else if(match.state === 2){
                      match.ended = true;
                    }else{}
                    contractMatches.push(match);
                    this.setState({matches: contractMatches})
                  }
                }).catch(error => {
                  console.log('getMatch error', error);
                });
               
              }
            }).catch(error=>{
              console.log(error);
            })
            
          });          
        }
    });    
  }


  render() {
    if (this.state.loading) {
      return <Preloader />;
    }
  
    return (
      <div className={"page-wrapper"}>
        <Grid container spacing={3}>
          {this.state.matches.length === 0 ? (
            <p className="center">No Current Matches to show.... <Preloader /></p>
            
          ) : (
            this.state.matches.map((match, index) => (
              <Grid key={index} item xs={12} sm={6}>
                <Paper className={"match-paper"} elevation={2}>
                  <MatchCard match={match} contract={this.state.contract} account={this.state.account} />
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