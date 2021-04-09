import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Avt from "../layout/AvatarImg";
import { Button, Paper } from "@material-ui/core";
import MatchModal from "./MatchModal";
import MatchInfo from "./MatchInfoModal";

export const UpcomingMatchCard = ({ match }) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createInfoModalOpen, setCreateInfoModalOpen] = useState(false);

  const getDetails = (team) => {
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

  const getDateString = (ds) => {
    const date = new Date(ds);

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span
          style={{ fontSize: "15px", marginRight: "3px" }}
          className="material-icons"
        >
          calendar_today
        </span>
        <span>{`${date.getMonth() +
          1}-${date.getDate()}-${date.getFullYear()}`}</span>
        <span
          style={{ fontSize: "15px", marginRight: "3px", marginLeft: "15px" }}
          className="material-icons"
        >
          schedule
        </span>
        <span>{`${date.getHours()}:${date.getMinutes()}`} UTC</span>
      </div>
    );
  };

  return (
    <div>
      {/* <img src={match.league.image_url} alt='' style={{width:'60px',borderRadius:"50%"}}/> */}
      <Grid container spacing={3} alignItems="center" justify="center">
        <Grid item xs={5}>
          {getDetails(0)}
        </Grid>
        <Grid item xs={2}>
          VS
        </Grid>
        <Grid item xs={5}>
          {getDetails(1)}
        </Grid>
        <Grid item xs={12}>
          <Paper
            style={{
              height: "100%",
              width: "100%",
              backgroundColor: "#505050",
              padding: "8px",
            }}
            elevation={0}
          >
            {getDateString(match.begin_at)}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Button
            style={{
              backgroundColor: "#408cff",
              color: "#ffffff",
              fontWeight: "bold",
            }}
            onClick={() => setCreateInfoModalOpen(true)}
            variant="contained"
            fullWidth
          >
            SHOW MORE
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button
            style={{
              backgroundColor: "#e94560",
              color: "#ffffff",
              fontWeight: "bold",
            }}
            onClick={() => setCreateModalOpen(true)}
            variant="contained"
            fullWidth
          >
            CREATE MATCH
          </Button>
        </Grid>
      </Grid>
      <MatchModal
        open={createModalOpen}
        setCreateModalOpen={setCreateModalOpen}
        match={match}
      />
      <MatchInfo
        open={createInfoModalOpen}
        setCreateModalOpen={setCreateInfoModalOpen}
        match={match}
      />
    </div>
  );
};

UpcomingMatchCard.propTypes = {
  match: PropTypes.object.isRequired,
};

export default UpcomingMatchCard;
