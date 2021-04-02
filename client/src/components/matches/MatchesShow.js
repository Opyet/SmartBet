import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
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
import { getContractMatch, getBets } from "../../actions/matchesActions";
import axios from "axios";
import Preloader from "../layout/Preloader";
import history from "../../history";

const MatchesShow = ({
  matches,
  getContractMatch,
  contract,
  account,
  getBets,
  network,
  betsA,
  betsB,
}) => {
  const { id } = useParams();

  const [apiData, setApiData] = useState(null);
  const [teamSelected, setTeamSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [betAmount, setBetAmount] = useState();
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);

  useEffect(() => {
    (async () => {
      if (contract) {
        await getContractMatch(id);
        await getBets(id);
      }
    })();
  }, [id, getContractMatch, contract, getBets]);

  const match = matches[id];

  useEffect(() => {
    if (match) {
      (async () => {
        const res = await axios.get(
          "https://tranquil-escarpment-56296.herokuapp.com/" + match.apiUrl
        );
        setApiData(res.data);
      })();
    }
  }, [match, setApiData]);

  if (!match || !apiData) {
    return <Preloader />;
  }

  if (match.admin === account) {
    history.push(`/matches/${match.id}/admin`);
  }

  const payOutCheck = () => {
    if (!match.ended) return true;

    if (match.winner === match.teamA && Object.keys(betsA).length > 0)
      return false;
    else if (match.winner === match.teamB && Object.keys(betsB).length > 0)
      return false;
    else return true;
  };

  const withdrawPayout = async () => {
    try {
      setLoadingWithdraw(true);
      if (match.winner === match.teamA) {
        await Promise.all(
          Object.keys(betsA).map(
            async (bet) =>
              await contract.methods
                .retrievePayout(match.id, parseInt(bet))
                .send({
                  from: account,
                })
          )
        );
      } else {
        await Promise.all(
          Object.keys(betsB).map(
            async (bet) =>
              await contract.methods
                .retrievePayout(match.id, parseInt(bet))
                .send({
                  from: account,
                })
          )
        );
      }
      setLoadingWithdraw(false);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
    setLoadingWithdraw(false);
  };

  const bet = async () => {
    try {
      setLoading(true);
      await contract.methods.bet(match.id, teamSelected).send({
        value: parseInt(betAmount * 10 ** 18),
        from: account,
      });
      setLoading(false);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }

    setLoading(false);
  };

  const getImageSection = (team) => {
    const opp = apiData.opponents[team].opponent;
    const colors = ["#ff2e2e", "#3877ff"];
    const avatarStyle = {
      width: "196px",
      height: "196px",
      backgroundColor: colors[team],
      fontSize: "72px",
      color: "#ffffff",
      cursor: "pointer",
    };

    const teams = [match.teamA, match.teamB];

    let winTag = {
      height: match.winner === teams[team] ? "5vw" : "0vw",
      width: match.winner === teams[team] ? "5vw" : "0vw",
      position: "absolute",
      zIndex: "100000",
      bottom: "0px",
      right: "0px",
      display: "block",
    };

    const borderStyle = match.ended
      ? {
          padding: match.winner === teams[team] ? "10px" : "15px",
          border: match.winner === teams[team] ? `5px #FFD700 solid` : "none",
        }
      : {
          padding: teamSelected === team ? "5px" : "10px",
          border: teamSelected === team ? `5px ${colors[team]} dashed` : "none",
        };
    const handleSelection = () => {
      setTeamSelected(team);
    };
    let avatar;
    if (!opp.image_url) {
      avatar = (
        <div onClick={handleSelection} style={{ ...borderStyle }}>
          <Avatar
            variant="rounded"
            style={{ ...avatarStyle, position: "relative" }}
          >
            {match.ended && match.winner === teams[team] ? (
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
          {match.ended && match.winner === teams[team] ? (
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
            {team === 0 ? match.oddsA / 100 : match.oddsB / 100}
          </span>
        </div>
      </React.Fragment>
    );
  };

  const getTable = () => {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ fontWeight: "bold" }}>Team</TableCell>
            <TableCell style={{ fontWeight: "bold" }}>Odds</TableCell>
            <TableCell style={{ fontWeight: "bold" }}>
              {network === 42 ? "ETH" : "MATIC"}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(betsA).map((key, index) => (
            <TableRow key={index}>
              <TableCell>{apiData.opponents[0].opponent.name}</TableCell>
              <TableCell>{key / 100}</TableCell>
              <TableCell>{(betsA[key] / 10 ** 18).toFixed(2)}</TableCell>
            </TableRow>
          ))}
          {Object.keys(betsB).map((key, index) => (
            <TableRow key={index}>
              <TableCell>{apiData.opponents[1].opponent.name}</TableCell>
              <TableCell>{key / 100}</TableCell>
              <TableCell>{(betsB[key] / 10 ** 18).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Grid style={{ height: "100%" }} container spacing={2}>
      <Grid style={gridItemStyle} item container xs={8}>
        <Card style={cardStyle}>
          <CardHeader
            title={
              <h5 style={cardHeader}>
                <span>PLACE BET</span>
                {match.ended && <span style={{ color: "red" }}>CLOSED</span>}
              </h5>
            }
          />
          <CardContent style={{ height: "100%" }}>
            <Grid style={{ height: "65%" }} container spacing={2}>
              <Grid style={gridItemStyle} item xs={5} container>
                {getImageSection(0)}
              </Grid>
              <Grid item xs={2} style={gridItemStyle} container>
                VS
              </Grid>
              <Grid item xs={5} style={gridItemStyle} container>
                {getImageSection(1)}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label={`Bet Amount in ${network === 42 ? "ETH" : "MATIC"}`}
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  onClick={bet}
                  style={{
                    backgroundColor: match.ended ? "#595959" : "#357a38",
                    color: !match.ended ? "#ffffff" : "#878787",
                    fontWeight: "bold",
                  }}
                  variant="contained"
                  fullWidth
                  disabled={match.ended}
                >
                  {loading ? (
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
            {getTable()}
            <Button
              onClick={withdrawPayout}
              style={{ fontWeight: "bold" }}
              color="secondary"
              variant="contained"
              disabled={payOutCheck()}
              fullWidth
            >
              {loadingWithdraw ? (
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
};

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

const mapStateToProps = (state) => {
  return {
    matches: state.matches,
    contract: state.ethereum.contract,
    account: state.ethereum.account,
    network: state.ethereum.network,
    betsA: state.bets.betsA,
    betsB: state.bets.betsB,
  };
};

export default connect(mapStateToProps, { getContractMatch, getBets })(
  MatchesShow
);
