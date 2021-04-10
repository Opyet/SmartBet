import React, { Component } from 'react';
import { useParams } from "react-router-dom";
import CusAvatar from "../layout/CustomizedAvatar";
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Avatar,
  Button,
  TextField,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@material-ui/core";
import Preloader from "../layout/Preloader";
import history from "../../history";

const cardHeader = {
  display: "flex",
  alignItem: "center",
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


class MatchesShow extends Component {
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

  setBetAmount(value){
    this.setState({betAmount: [value]});
  }

  setLoading(value){
    this.setState({loading: [value]});
  }

  setTeamSelected(value){
    this.setState({teamSelected: [value]});
  }

  render() {
    if (!this.state.match || !this.state.apiData) {
      return <Preloader />;
    }
  
    if (this.state.match.admin === this.state.account) {
      history.push(`/matches/${this.state.match.id}/admin`);
    }
    
    return (
      <Grid style={{ height: "100%" }} container spacing={2}>
        <Grid style={gridItemStyle} item container xs={8}>
          <Card style={cardStyle}>
            <CardHeader
              title={
                <h5 style={cardHeader}>
                  <span>PLACE BET</span>
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label={`Bet Amount in ${this.state.network === 42 ? "ETH" : "MATIC"}`}
                    value={this.state.betAmount}
                    onChange={(e) => this.setBetAmount(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    onClick={this.bet}
                    style={{
                      backgroundColor: this.state.match.ended ? "#595959" : "#357a38",
                      color: !this.state.match.ended ? "#ffffff" : "#878787",
                      fontWeight: "bold",
                    }}
                    variant="contained"
                    fullWidth
                    disabled={this.state.match.ended}
                  >
                    {this.state.loading ? (
                      <CircularProgress size={24} style={{ color: "white" }} />
                    ) : (
                      "PLACE BET"
                    )}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid style={gridItemStyle} item container xs={4}>
          <Card style={cardStyle}>
            <CardHeader title={<h5 style={cardHeader}>YOUR BETS</h5>} />
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
              <Button
                onClick={this.withdrawPayout}
                style={{ fontWeight: "bold" }}
                color="secondary"
                variant="contained"
                disabled={this.payOutCheck()}
                fullWidth
              >
                {this.state.loadingWithdraw ? (
                  <CircularProgress size={24} style={{ color: "white" }} />
                ) : (
                  "WITHDRAW PAYOUT"
                )}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  
  withdrawPayout = async () => {
    try {
      this.setLoadingWithdraw(true);
      if (this.state.match.winner === this.state.match.teamA) {
        await Promise.all(
          Object.keys(this.state.betsA).map(
            async (bet) =>
              await this.state.contract.methods
                .retrievePayout(this.state.match.id, parseInt(bet))
                .send({
                  from: this.state.account,
                })
          )
        );
      } else {
        await Promise.all(
          Object.keys(this.state.betsB).map(
            async (bet) =>
              await this.state.contract.methods
                .retrievePayout(this.state.match.id, parseInt(bet))
                .send({
                  from: this.state.account,
                })
          )
        );
      }
      this.setLoadingWithdraw(false);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
    this.setLoadingWithdraw(false);
  }

  bet = async () => {
    try {
      this.setLoading(true);
      await this.state.contract.methods.bet(this.state.match.id, this.state.teamSelected).send({
        value: parseInt(this.state.betAmount * 10 ** 18),
        from: this.state.account,
      });
      this.setLoading(false);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }

    this.setLoading(false);
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
      cursor: "pointer",
    };

    const teams = [this.state.match.teamA, this.state.match.teamB];

    let winTag = {
      height: this.state.match.winner === teams[team] ? "5vw" : "0vw",
      width: this.state.match.winner === teams[team] ? "5vw" : "0vw",
      position: "absolute",
      zIndex: "100000",
      bottom: "0px",
      right: "0px",
      display: "block",
    };

    const borderStyle = this.state.match.ended
      ? {
          padding: this.state.match.winner === teams[team] ? "10px" : "15px",
          border: this.state.match.winner === teams[team] ? `5px #FFD700 solid` : "none",
        }
      : {
          padding: this.state.teamSelected === team ? "5px" : "10px",
          border: this.state.teamSelected === team ? `5px ${colors[team]} dashed` : "none",
        };
    const handleSelection = () => {
      this.setTeamSelected(team);
    };
    let avatar;
    if (!opp.image_url) {
      avatar = (
        <div onClick={handleSelection} style={{ ...borderStyle }}>
          <Avatar
            variant="rounded"
            style={{ ...avatarStyle, position: "relative" }}
          >
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
        <div onClick={handleSelection} style={borderStyle}>
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
            {team === 0 ? this.state.match.oddsA / 100 : this.state.match.oddsB / 100}
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
            <TableCell style={{ fontWeight: "bold" }}>Team</TableCell>
            <TableCell style={{ fontWeight: "bold" }}>Odds</TableCell>
            <TableCell style={{ fontWeight: "bold" }}>
              {this.state.network === 42 ? "ETH" : "MATIC"}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(this.state.betsA).map((key, index) => (
            <TableRow key={index}>
              <TableCell>{this.state.apiData.opponents[0].opponent.name}</TableCell>
              <TableCell>{key / 100}</TableCell>
              <TableCell>{(this.state.betsA[key] / 10 ** 18).toFixed(2)}</TableCell>
            </TableRow>
          ))}
          {Object.keys(this.state.betsB).map((key, index) => (
            <TableRow key={index}>
              <TableCell>{this.state.apiData.opponents[1].opponent.name}</TableCell>
              <TableCell>{key / 100}</TableCell>
              <TableCell>{(this.state.betsB[key] / 10 ** 18).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  payOutCheck = () => {
    if (!this.state.match.ended) return true;

    if (this.state.match.winner === this.state.match.teamA && Object.keys(this.state.betsA).length > 0)
      return false;
    else if (this.state.match.winner === this.state.match.teamB && Object.keys(this.state.betsB).length > 0)
      return false;
    else return true;
  }
}

export default MatchesShow;