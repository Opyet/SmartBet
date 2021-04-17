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
import Avt from "../layout/AvatarImg";
import history from "../../history";

export const MatchModal = ({ open, setCreateModalOpen, match, contract, account }) => {
  const [loading, setLoading] = useState(false);
  const [oddsA, setOddsA] = useState();
  const [oddsB, setOddsB] = useState();
  const [oddsDraw, setOddsDraw] = useState();
  const [margin, setMargin] = useState();

  const createMatch = async () => {
    const opp2 = match.awayTeam.team_name;
    const matchUrl = `fixtures/id/${match.fixture_id}`;

    try {
      setLoading(true);
      // console.log('match details', JSON.stringify(match));
      if(!match.fixture_id || !matchUrl || !oddsA || !oddsDraw || !oddsB || !match.firstHalfStart){
        alert('incomplete match details');
      }
      if(!match.firstHalfStart) {match.firstHalfStart = Date.now() + (8*3600);}
      console.log('add new match', parseInt(match.fixture_id),
        matchUrl,
        parseInt(oddsA * 100),
        parseInt(oddsB * 100),
        parseInt(oddsDraw * 100),
        parseInt(match.firstHalfStart));

      await contract.methods.createMatch(
          parseInt(match.fixture_id),
          matchUrl,
          parseInt(oddsA * 100),
          parseInt(oddsB * 100),
          parseInt(oddsDraw * 100),
          parseInt(match.firstHalfStart)
        )
        .send({
          value: 0,
          from: account
        });
      setLoading(false);
      history.push("/matches");
      setCreateModalOpen(false);
    } catch (err) {
      console.log(err);
      alert(err.message);
    }
    setLoading(false);
  };

  const getImage = (teamIndex) => {
    let team = null;

    if(teamIndex === 0){
      team = match.homeTeam;
    }
    if(teamIndex === 1){
      team = match.awayTeam;
    }

    return (
      <div>
        {team.logo ? (
          <Avt link={team.logo} letter={null} index={teamIndex} />
        ) : (
          <Avt link={null} letter={team.team_name} index={teamIndex} />
        )}
        <span style={{ fontSize: "15px", fontWeight: "bold" }}>{team.team_name}</span>
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
            <Grid item xs={4}>
              <TextField
                value={oddsA}
                onChange={(e) => setOddsA(e.target.value)}
                variant="outlined"
                fullWidth
                label="Odds Team A"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                value={oddsDraw}
                onChange={(e) => setOddsDraw(e.target.value)}
                variant="outlined"
                fullWidth
                label="Odds Draw"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                value={oddsB}
                onChange={(e) => setOddsB(e.target.value)}
                variant="outlined"
                fullWidth
                label="Odds Team B"
              />
            </Grid>
            {/* <Grid item xs={12}>
              <TextField
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                variant="outlined"
                fullWidth
                label="Initial Margin"
              />
            </Grid> */}
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

export default MatchModal;