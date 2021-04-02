import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
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
import { getContractMatch } from "../../actions/matchesActions";
import axios from "axios";
import Preloader from "../layout/Preloader";
import CusAvatar from "../layout/CustomizedAvatar";

const MatchesShowAdmin = ({
  matches,
  getContractMatch,
  contract,
  account,
  network,
}) => {
  const { id } = useParams();

  const [apiData, setApiData] = useState(null);
  const [oddsA, setOddsA] = useState();
  const [oddsB, setOddsB] = useState();
  const [margin, setMargin] = useState();
  const [loadingOdds, setLoadingOdds] = useState(false);
  const [loadingMargin, setLoadingMargin] = useState(false);
  const [loadingClose, setLoadingClose] = useState(false);
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);

  useEffect(() => {
    (async () => {
      if (contract) await getContractMatch(id);
    })();
  }, [id, getContractMatch, contract]);

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

  const withdrawPayout = async () => {
    try {
      setLoadingWithdraw(true);
      await contract.methods.retrieveBookiePayout(match.id).send({
        from: account,
      });
      setLoadingWithdraw(false);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
    setLoadingWithdraw(false);
  };

  const changeOdds = async () => {
    try {
      setLoadingOdds(true);
      await contract.methods
        .changeOdds(match.id, parseInt(oddsA * 100), parseInt(oddsB * 100))
        .send({ from: account });
      setLoadingOdds(false);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
    setLoadingOdds(false);
  };

  const addMargin = async () => {
    try {
      setLoadingMargin(true);
      await contract.methods
        .addMargin(match.id)
        .send({ from: account, value: parseInt(margin * 10 ** 18) });
      setLoadingMargin(false);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
    setLoadingMargin(false);
  };

  const closeMatch = async () => {
    try {
      setLoadingClose(true);
      await contract.methods.closeMatch(match.id).send({
        from: account,
      });
      setLoadingClose(false);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
    setLoadingClose(false);
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
    };

    const teams = [match.teamA, match.teamB];

    const borderStyle = {
      padding: match.winner === teams[team] ? "10px" : "15px",
      border: match.winner === teams[team] ? `5px #FFD700 solid` : "none",
    };

    let winTag = {
      height: match.winner === teams[team] ? "5vw" : "0vw",
      width: match.winner === teams[team] ? "5vw" : "0vw",
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
        <div style={borderStyle}>
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
            <TableCell style={{ fontWeight: "bold" }}>Item</TableCell>
            <TableCell style={{ fontWeight: "bold" }}>
              {network === 42 ? "ETH" : "MATIC"}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Payout A</TableCell>
            <TableCell>{(match.totalPayoutA / 10 ** 18).toFixed(2)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Payout B</TableCell>
            <TableCell>{(match.totalPayoutB / 10 ** 18).toFixed(2)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Total Collection</TableCell>
            <TableCell>
              {(match.totalCollection / 10 ** 18).toFixed(2)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Bookie Margin</TableCell>
            <TableCell>{(match.bookieMargin / 10 ** 18).toFixed(2)}</TableCell>
          </TableRow>
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
                <span>ADMIN PANEL</span>
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
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  id="outlined-basic"
                  label="Odds Team A"
                  variant="outlined"
                  value={oddsA}
                  onChange={(e) => setOddsA(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  id="outlined-basic"
                  label="Odds Team B"
                  variant="outlined"
                  value={oddsB}
                  onChange={(e) => setOddsB(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  style={{
                    backgroundColor: match.ended ? "#595959" : "#357a38",
                    color: !match.ended ? "#ffffff" : "#878787",
                    fontWeight: "bold",
                  }}
                  disabled={match.ended}
                  variant="contained"
                  fullWidth
                  onClick={changeOdds}
                >
                  {loadingOdds ? (
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
            {getTable()}
            {match.ended ? (
              <div>
                {" "}
                <Button
                  onClick={withdrawPayout}
                  style={{
                    fontWeight: "bold",
                  }}
                  fullWidth
                  disabled={parseInt(match.bookiePayout) === 0}
                  variant="contained"
                  color="secondary"
                >
                  {loadingWithdraw ? (
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
                  label={`Extra Margin in ${network === 42 ? "ETH" : "MATIC"}`}
                  style={{ marginBottom: "16px" }}
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                />
                <Button
                  style={{ fontWeight: "bold" }}
                  fullWidth
                  color="primary"
                  variant="contained"
                  onClick={addMargin}
                  disabled={match.ended}
                >
                  {loadingMargin ? (
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
          onClick={closeMatch}
          style={{
            backgroundColor: match.ended ? "#595959" : "red",
            color: !match.ended ? "#ffffff" : "#878787",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
          disabled={match.ended}
          variant="contained"
        >
          {loadingClose ? (
            <CircularProgress size={24} style={{ color: "white" }} />
          ) : (
            "CLOSE MATCH"
          )}
        </Button>
      </Grid>
    </Grid>
  );
};

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

const mapStateToProps = (state) => {
  return {
    matches: state.matches,
    contract: state.ethereum.contract,
    account: state.ethereum.account,
    network: state.ethereum.network,
  };
};

export default connect(mapStateToProps, { getContractMatch })(MatchesShowAdmin);
