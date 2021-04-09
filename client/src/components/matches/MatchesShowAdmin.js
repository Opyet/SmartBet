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
    }
  }

  componentWillMount() {
    this.setState({contract: this.props.baseAppState.contract});
    this.setState({account: this.props.baseAppState.accounts[0]});
  }

  componentDidMount() {

  }

  componentWillUnmount() {

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
    if (!this.state.this.state.match || !this.state.apiData) {
      return <Preloader />;
    }
  
    return (
      <Grid style={{ height: "100%" }} container spacing={2}>
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
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    id="outlined-basic"
                    label="Odds Team A"
                    variant="outlined"
                    value={this.state.oddsA}
                    onChange={(e) => this.setOddsA(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    id="outlined-basic"
                    label="Odds Team B"
                    variant="outlined"
                    value={this.state.oddsB}
                    onChange={(e) => this.setOddsB(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
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
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid style={gridItemStyle} item container xs={4}>
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
        </Grid>
        <Grid container item xs={12} alignItems="center" justify="center">
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
          >
            {this.state.loadingClose ? (
              <CircularProgress size={24} style={{ color: "white" }} />
            ) : (
              "CLOSE MATCH"
            )}
          </Button>
        </Grid>
      </Grid>
    );
  }

  
  withdrawPayout = async () => {
    try {
      this.setLoadingWithdraw(true);
      await this.state.contract.methods.retrieveBookiePayout(this.state.match.id).send({
        from: this.state.account,
      });
      this.setLoadingWithdraw(false);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
    this.setLoadingWithdraw(false);
  }

  changeOdds = async () => {
    try {
      this.ButtonsetLoadingOdds(true);
      await this.state.contract.methods
        .changeOdds(this.state.match.id, parseInt(this.state.oddsA * 100), parseInt(this.state.oddsB * 100))
        .send({ from: this.state.account });
      this.setLoadingOdds(false);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
    this.setLoadingOdds(false);
  }

  addMargin = async () => {
    try {
      this.setLoadingMargin(true);
      await this.state.contract.methods
        .addMargin(this.state.match.id)
        .send({ from: this.state.account, value: parseInt(this.state.margin * 10 ** 18) });
        this.setLoadingMargin(false);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
    this.setLoadingMargin(false);
  }

  closeMatch = async () => {
    try {
      this.setLoadingClose(true);
      await this.state.contract.methods.closeMatch(this.state.match.id).send({
        from: this.state.account,
      });
      this.setLoadingClose(false);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
    this.setLoadingClose(false);
  }

  getImageSection = (team) => {
    const opp = this.state.apiData.opponents[team].opponent;
    const colors = ["#ff2e2e", "#3877ff"];
    const avatarStyle = {
      width: "196px",
      height: "196px",
      backgroundColor: colors[team],
      fontSize: "72px",
      color: "#ffffff",
    };

    const teams = [this.state.match.teamA, this.state.match.teamB];

    const borderStyle = {
      padding: this.state.match.winner === teams[team] ? "10px" : "15px",
      border: this.state.match.winner === teams[team] ? `5px #FFD700 solid` : "none",
    };

    let winTag = {
      height: this.state.match.winner === teams[team] ? "5vw" : "0vw",
      width: this.state.match.winner === teams[team] ? "5vw" : "0vw",
      position: "absolute",
      zIndex: "100000",
      bottom: "0px",
      right: "0px",
      display: "block",
    };

    let avatar;
    if (!opp.image_url) {
      avatar = (
        <div style={borderStyle}>
          <Avatar variant="rounded" style={avatarStyle}>
            {this.state.match.ended && this.state.match.winner === teams[team] ? (
              <img
                src={process.env.PUBLIC_URL + "/images/winnerTag.png"}
                style={winTag}
              />
            ) : (
              <></>
            )}
            {opp.name[0]}
          </Avatar>
        </div>
      );
    } else {
      avatar = (
        <div style={borderStyle}>
          {this.state.match.ended && this.state.match.winner === teams[team] ? (
            <CusAvatar
              variant="rounded"
              style={{ ...avatarStyle, position: "relative" }}
              src={opp.image_url}
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
              src={opp.image_url}
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
          <span style={{ fontSize: "18px" }}>{opp.name}</span>
          <span style={{ fontSize: "21px", fontWeight: "bold" }}>
            {team === 0 ? this.state.match.this.state.oddsA / 100 : this.state.match.this.state.oddsB / 100}
          </span>
        </div>
      </React.Fragment>
    );
  }

  getTable = () => {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ fontWeight: "bold" }}>Item</TableCell>
            <TableCell style={{ fontWeight: "bold" }}>
              {this.state.network === 42 ? "ETH" : "MATIC"}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Payout A</TableCell>
            <TableCell>{(this.state.match.totalPayoutA / 10 ** 18).toFixed(2)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Payout B</TableCell>
            <TableCell>{(this.state.match.totalPayoutB / 10 ** 18).toFixed(2)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Total Collection</TableCell>
            <TableCell>
              {(this.state.match.totalCollection / 10 ** 18).toFixed(2)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Bookie Margin</TableCell>
            <TableCell>{(this.state.match.bookieMargin / 10 ** 18).toFixed(2)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

}

export default MatchesShowAdmin;