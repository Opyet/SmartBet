import React, { useState } from "react";
import {
  Button,
  Grid,
  makeStyles,
  Modal,
  Paper,
  TextField,
  CircularProgress,
} from "@material-ui/core";
import { connect } from "react-redux";
import Avt from "../layout/AvatarImg";
import history from "../../history";

const MatchModal = ({ open, setCreateModalOpen, match, contract, account }) => {
  const [loading, setLoading] = useState(false);
  const [oddsA, setOddsA] = useState();
  const [oddsB, setOddsB] = useState();
  const [margin, setMargin] = useState();

  const createMatch = async () => {
    const opp1 = match.opponents[0].opponent;
    const opp2 = match.opponents[1].opponent;
    const url = `https://api.pandascore.co/matches/${match.slug}?token=4AUFMvQbjLwRnnuM5NLQqVwj8WPu-wQgNssRZjpV9WDDjnvNI68`;

    try {
      setLoading(true);
      await contract.methods
        .createMatch(
          opp1.id,
          opp2.id,
          parseInt(oddsA * 100),
          parseInt(oddsB * 100),
          url
        )
        .send({
          value: parseInt(margin * 10 ** 18),
          from: account,
        });
      setLoading(false);
      history.push("/matches");
      setCreateModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const getImage = (team) => {
    const opp = match.opponents[team].opponent;

    return (
      <div>
        {opp.image_url ? (
          <Avt link={opp.image_url} letter={null} index={team} />
        ) : (
          <Avt link={null} letter={opp.name[0]} index={team} />
        )}
        <span style={{ fontSize: "15px", fontWeight: "bold" }}>{opp.name}</span>
      </div>
    );
  };

  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: "center",
      color: theme.palette.text.secondary,
    },
  }));

  const classes = useStyles();

  return (
    <Modal
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      open={open}
      onClose={() => setCreateModalOpen(false)}
    >
      <div style={modalStyle}>
        <span style={{ fontWeight: "bold", fontSize: "18px", padding: "5px" }}>
          CREATE MATCH
        </span>
        <Paper className={classes.paper} elevation={0}>
          <Grid container spacing={2} alignItems="center" justify="center">
            <Grid item xs={5}>
              {getImage(0)}
            </Grid>
            <Grid item xs={2}>
              VS
            </Grid>
            <Grid item xs={5}>
              {getImage(1)}
            </Grid>
            <Grid item xs={6}>
              <TextField
                value={oddsA}
                onChange={(e) => setOddsA(e.target.value)}
                variant="outlined"
                fullWidth
                label="Odds Team A"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                value={oddsB}
                onChange={(e) => setOddsB(e.target.value)}
                variant="outlined"
                fullWidth
                label="Odds Team B"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                variant="outlined"
                fullWidth
                label="Initial Margin"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                style={{ fontWeight: "bold" }}
                onClick={createMatch}
                variant="contained"
                fullWidth
                color="primary"
              >
                {loading ? (
                  <CircularProgress style={{ color: "white" }} size={24} />
                ) : (
                  "CREATE MATCH"
                )}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </div>
    </Modal>
  );
};

const modalStyle = {
  position: "absolute",
  top: "20%",
  margin: "auto",
  backgroundColor: "#424242",
  width: "50%",
  height: "58%",
  padding: "10px",
};

const mapStateToProps = (state) => {
  return {
    contract: state.ethereum.contract,
    account: state.ethereum.account,
  };
};

export default connect(mapStateToProps)(MatchModal);
