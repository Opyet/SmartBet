import React, { Component, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Avatar,
  Button,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  CircularProgress,
} from "@material-ui/core";
import Preloader from "../layout/Preloader";
import CusAvatar from "../layout/CustomizedAvatar";
import APICall from '../../utils/APICall';



const cardHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontWeight: "bold",
  margin: "0px",
  fontSize: "18px",
};
const cardStyle = { height: "95%", width: "100%" };
const gridItemStyle = {
  display: "flex",
  alignItems: "center",
  height: "100%",
  justifyContent: "center",
  flexDirection: "column",
};


class MatchesShowAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: null, 
      account: null, 
      contract: null,
      match: null,
      win: null, //0-teamA  1-teamB 2-draw (frontend)
      loadingClose: [],
      loadingStart: [],

    }
  }

  componentWillMount() {
    if(this.props.baseAppState){
      this.setState({contract: this.props.baseAppState.contract});
      this.setState({account: this.props.baseAppState.accounts[0]});
    }
    

  }

  componentDidMount() {
    let url = window.location.href;
    url = url.replace('/admin','');
    let n = url.lastIndexOf('/');
    let payload = url.substring(n + 1);
    let matchId = parseInt(atob(payload));    

    this.setState({matchId: matchId});
    
    if(!this.state.match){
      this.getMatch(matchId);
    }
    
  }
 
  getMatch =(matchId)=>{
    this.state.contract.methods.getMatch(matchId).call({from: this.state.account})
    .then(response => {
      if(response){
        console.log('getMatch', response);
        
        APICall(response.matchResultLink).then(result=>{
          console.log('match details', result);
          if(result){
            let match = result.api.fixtures[0];
            let winner = null; //betOn
            
            if(parseInt(match.goalsHomeTeam) > parseInt(match.goalsAwayTeam)){
              match.winnerBetOn = 0;
            }else if(parseInt(match.goalsHomeTeam) < parseInt(match.goalsAwayTeam)){
              match.winnerBetOn = 1;
            } else{
              match.winnerBetOn = 2;
            }
            
            match.id = matchId;  
            match.oddsA = response.oddsTeamA;
            match.oddsB = response.oddsTeamB;
            match.oddsDraw = response.oddsDraw;               
            // if(!this.state.match){
              this.setState({match: match});
            // }
          }
        }).catch(error=>{
          console.log(error);
        })
      }
    }).catch(error => {
      console.log('getMatch error', error);
    });
  }

  setLoadingClose(value){
    this.setState({loadingClose: [value]});
  }

  setLoadingWithdraw(value){
    this.setState({loadingWithdraw: [value]});
  }

  // setBetAmount(value){
  //   this.setState({betAmount: [value]});
  // }

  // setLoading(value){
  //   this.setState({loading: [value]});
  // }

  setLoadingOdds(value){
    this.setState({loadingOdds: [value]});
  }

  setLoadingStart(value){
    this.setState({loadingStart: [value]});
  }

  setMargin(value){
    this.setState({margin: [value]});
  }

  setOddsA(value){
    this.setState({oddsA: [value]});
  }

  setOddsB(value){
    this.setState({oddsB: [value]});
  }

  render() {
    if (!this.state.match) {
      return <Preloader />;
    }
  
    return (
      <Grid style={{ height: "100%",  position: 'relative', top: '-20px'  }} container spacing={2}>
        <Grid style={gridItemStyle} item container xs={8}>
          <Card style={cardStyle}>
            <CardHeader
              title={
                <h5 style={cardHeader}>
                  <span>ADMIN PANEL</span>
                  {this.state.match.ended && <span style={{ color: "red" }}>CLOSED</span>}
                </h5>
              }
            />
            <CardContent style={{ height: "100%" }}>
              <Grid style={{ height: "65%" }} container spacing={2}>
                <Grid style={gridItemStyle} item xs={5} container>
                  {this.getImageSection(0)}
                </Grid>
                <Grid item xs={2} style={gridItemStyle} container>
                  VS
                </Grid>
                <Grid item xs={5} style={gridItemStyle} container>
                  {this.getImageSection(1)}
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    id="outlined-basic"
                    label="Odds Team A"
                    variant="outlined"
                    disabled
                    value={(this.state.match.oddsA / 100).toFixed(2)}
                    onChange={(e) => this.setOddsA(e.target.value)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    id="outlined-basic"
                    label="Odds Draw"
                    variant="outlined"
                    disabled
                    value={(this.state.match.oddsDraw / 100).toFixed(2)}
                    onChange={(e) => this.setOddsDraw(e.target.value)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    id="outlined-basic"
                    label="Odds Team B"
                    variant="outlined"
                    disabled
                    value={(this.state.match.oddsB / 100).toFixed(2)}
                    onChange={(e) => this.setOddsB(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Button
                    onClick={this.closeMatch}
                    style={{
                      backgroundColor: this.state.match.ended ? "#595959" : "red",
                      color: !this.state.match.ended ? "#ffffff" : "#878787",
                      fontWeight: "bold",
                      marginBottom: "20px",
                    }}
                    disabled={this.state.match.ended}
                    variant="contained"
                    fullWidth
                  >
                    {this.state.loadingClose[0] ? (
                      <CircularProgress size={24} style={{ color: "white" }} />
                    ) : (
                      "CLOSE MATCH"
                    )}
                  </Button>
                  {/* <Button
                    style={{
                      backgroundColor: this.state.match.ended ? "#595959" : "#357a38",
                      color: !this.state.match.ended ? "#ffffff" : "#878787",
                      fontWeight: "bold",
                    }}
                    disabled={this.state.match.ended}
                    variant="contained"
                    fullWidth
                    onClick={this.changeOdds}
                  >
                    {this.state.loadingOdds ? (
                      <CircularProgress size={24} style={{ color: "white" }} />
                    ) : (
                      "CHANGE ODDS"
                    )}
                  </Button> */}
                </Grid>
                <Grid item xs={6}>
                  <Button
                    style={{
                      backgroundColor: this.state.match.ended ? "#595959" : "#357a38",
                      color: !this.state.match.ended ? "#ffffff" : "#878787",
                      fontWeight: "bold",
                    }}
                    disabled={this.state.match.ended}
                    variant="contained"
                    fullWidth
                    onClick={this.startMatch}
                  >
                    {this.state.loadingStart[0] ? (
                      <CircularProgress size={24} style={{ color: "white" }} />
                    ) : (
                      "START MATCH"
                    )}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        {/* <Grid style={gridItemStyle} item container xs={4}>
          <Card style={cardStyle}>
            <CardHeader title={<h5 style={cardHeader}>MATCH PANEL</h5>} />
            <CardContent
              style={{
                padding: "2px 15px",
                display: "flex",
                justifyContent: "space-between",
                flexDirection: "column",
                height: "calc(83% - 2px)",
              }}
            >
              {this.getTable()}
              {this.state.match.ended ? (
                <div>
                  {" "}
                  <Button
                    onClick={this.withdrawPayout}
                    style={{
                      fontWeight: "bold",
                    }}
                    fullWidth
                    disabled={parseInt(this.state.match.bookiePayout) === 0}
                    variant="contained"
                    color="secondary"
                  >
                    {this.state.loadingWithdraw ? (
                      <CircularProgress size={24} style={{ color: "white" }} />
                    ) : (
                      "WITHDRAW PAYOUT"
                    )}
                  </Button>
                </div>
              ) : (
                <div>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label={`Extra Margin in ${this.state.network === 42 ? "ETH" : "MATIC"}`}
                    style={{ marginBottom: "16px" }}
                    value={this.state.margin}
                    onChange={(e) => this.setMargin(e.target.value)}
                  />
                  <Button
                    style={{ fontWeight: "bold" }}
                    fullWidth
                    color="primary"
                    variant="contained"
                    onClick={this.addMargin}
                    disabled={this.state.match.ended}
                  >
                    {this.state.loadingMargin ? (
                      <CircularProgress size={24} style={{ color: "white" }} />
                    ) : (
                      "ADD MARGIN"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </Grid> */}
        
      </Grid>
    );
  }

  
  // withdrawPayout = async () => {
  //   try {
  //     this.setLoadingWithdraw(true);
  //     await this.state.contract.methods.retrieveBookiePayout(this.state.match.id).send({
  //       from: this.state.account,
  //     });
  //     this.setLoadingWithdraw(false);
  //     window.location.reload();
  //   } catch (err) {
  //     alert(err.message);
  //   }
  //   this.setLoadingWithdraw(false);
  // }

  // changeOdds = async () => {
  //   try {
  //     this.ButtonsetLoadingOdds(true);
  //     await this.state.contract.methods
  //       .changeOdds(this.state.match.id, parseInt(this.state.oddsA * 100), parseInt(this.state.oddsB * 100))
  //       .send({ from: this.state.account });
  //     this.setLoadingOdds(false);
  //     window.location.reload();
  //   } catch (err) {
  //     alert(err.message);
  //   }
  //   this.setLoadingOdds(false);
  // }

  // addMargin = async () => {
  //   try {
  //     this.setLoadingMargin(true);
  //     await this.state.contract.methods
  //       .addMargin(this.state.match.id)
  //       .send({ from: this.state.account, value: parseInt(this.state.margin * 10 ** 18) });
  //       this.setLoadingMargin(false);
  //     window.location.reload();
  //   } catch (err) {
  //     alert(err.message);
  //   }
  //   this.setLoadingMargin(false);
  // }

  closeMatch = () => {
    try {
      this.setLoadingClose(true);

      //update fixtures data
      this.getMatch(this.state.matchId);

      let winnerBetOn = null;

      // 1: draw     2: teamA   3: teamB
      if(this.state.match.winnerBetOn == 0){//teamA
        winnerBetOn = 2;
      } else if(this.state.match.winnerBetOn == 1){//teamB
        winnerBetOn = 3;
      } else if(this.state.match.winnerBetOn == 2){//draw
        winnerBetOn = 1;
      }else{
        alert("could not determin match result");
        this.setLoadingClose(false);
        return;
      }

      this.state.contract.methods.closeMatch(this.state.matchId, winnerBetOn).send({        
        from: this.state.account
      }).then(result=>{
        console.log('close match success',result);

        this.setLoadingClose(false);
        window.location.reload();
      }).catch(error=>{
        console.log(error);
        this.setLoadingClose(false);
        window.location.reload();
      });
      
      this.setLoadingClose(false);
      // window.location.reload();
    } catch (err) {
      alert(err.message);
    }
    this.setLoadingClose(false);
  }

  startMatch = () => {
    try {
      this.setLoadingStart(true);

      this.state.contract.methods.startMatch(this.state.matchId).send({        
        from: this.state.account
      }).then(result=>{
        console.log('start match success',result);

        this.setLoadingStart(false);
        window.location.reload();
      }).catch(error=>{
        console.log(error);
        this.setLoadingStart(false);
        window.location.reload();
      });
      
      this.setLoadingStart(false);
      // window.location.reload();
    } catch (err) {
      alert(err.message);
    }
    this.setLoadingStart(false);
  }

  getImageSection = (teamIndex) => {
    let team = null;

    if(teamIndex === 0){
      team = this.state.match.homeTeam;
    }
    if(teamIndex === 1){
      team = this.state.match.awayTeam;
    } 
    
    const colors = ["#ff2e2e", "#3877ff"];
    const avatarStyle = {
      width: "196px",
      height: "196px",
      backgroundColor: colors[teamIndex],
      fontSize: "72px",
      color: "#ffffff",
    };

    const teams = [this.state.match.teamA, this.state.match.teamB];

    const borderStyle = {
      padding: this.state.match.winnerBetOn === teamIndex ? "10px" : "15px",
      border: this.state.match.winnerBetOn === teamIndex ? `5px #FFD700 solid` : "none",
    };

    let winTag = {
      height: this.state.match.winnerBetOn === teamIndex ? "5vw" : "0vw",
      width: this.state.match.winnerBetOn === teamIndex ? "5vw" : "0vw",
      position: "absolute",
      zIndex: "100000",
      bottom: "0px",
      right: "0px",
      display: "block",
    };

    let avatar;
    if (!team.logo) {
      avatar = (
        <div style={borderStyle}>
          <Avatar variant="rounded" style={avatarStyle}>
            {this.state.match.ended && this.state.match.winnerBetOn === teamIndex ? (
              <img
                src={process.env.PUBLIC_URL + "/images/winnerTag.png"}
                style={winTag}
              />
            ) : (
              <></>
            )}
            {team.team_name}
          </Avatar>
        </div>
      );
    } else {
      avatar = (
        <div style={borderStyle}>
          {this.state.match.ended && this.state.match.winnerBetOn === teamIndex ? (
            <CusAvatar
              variant="rounded"
              style={{ ...avatarStyle, position: "relative" }}
              src={team.logo}
              otherChild={
                <img
                  src={process.env.PUBLIC_URL + "/images/winnerTag.png"}
                  style={{ ...winTag }}
                />
              }
            ></CusAvatar>
          ) : (
            <Avatar
              variant="rounded"
              style={{ ...avatarStyle, position: "relative" }}
              src={team.logo}
            ></Avatar>
          )}
          {/* <Avatar variant="rounded" style={avatarStyle} src={opp.image_url} /> */}
        </div>
      );
    }

    return (
      <React.Fragment>
        {avatar}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "196px",
            marginTop: "20px",
          }}
        >
          <span style={{ fontSize: "18px" }}>{team.team_name}</span>
          <span style={{ fontSize: "21px", fontWeight: "bold" }}>
            {teamIndex === 0 ? this.state.match.oddsA / 100 : this.state.match.oddsB / 100}
          </span>
        </div>
      </React.Fragment>
    );
  }

  // getTable = () => {
  //   return (
  //     <Table>
  //       <TableHead>
  //         <TableRow>
  //           <TableCell style={{ fontWeight: "bold" }}>Item</TableCell>
  //           <TableCell style={{ fontWeight: "bold" }}>
  //             {this.state.network === 42 ? "ETH" : "MATIC"}
  //           </TableCell>
  //         </TableRow>
  //       </TableHead>
  //       <TableBody>
  //         <TableRow>
  //           <TableCell>Payout A</TableCell>
  //           <TableCell>{(this.state.match.totalPayoutA / 10 ** 18).toFixed(2)}</TableCell>
  //         </TableRow>
  //         <TableRow>
  //           <TableCell>Payout B</TableCell>
  //           <TableCell>{(this.state.match.totalPayoutB / 10 ** 18).toFixed(2)}</TableCell>
  //         </TableRow>
  //         <TableRow>
  //           <TableCell>Total Collection</TableCell>
  //           <TableCell>
  //             {(this.state.match.totalCollection / 10 ** 18).toFixed(2)}
  //           </TableCell>
  //         </TableRow>
  //         <TableRow>
  //           <TableCell>Bookie Margin</TableCell>
  //           <TableCell>{(this.state.match.bookieMargin / 10 ** 18).toFixed(2)}</TableCell>
  //         </TableRow>
  //       </TableBody>
  //     </Table>
  //   );
  // }

}

export default MatchesShowAdmin;