import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Avt from "../layout/AvatarImg";
import { Button, Paper } from "@material-ui/core";
import MatchModal from "./MatchModal";
import MatchInfo from "./MatchInfoModal";
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import ScheduleIcon from '@material-ui/icons/Schedule';

export const UpcomingMatchCard = ({ match, contract, account }) => {

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createInfoModalOpen, setCreateInfoModalOpen] = useState(false);

  const getDetails = (teamIndex) => {
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
        <div style={{width:'100%', textAlign: 'center', fontSize: "15px", fontWeight: "bold" }}>{team.team_name}</div>
      </div>
    );
  };

  
  const getDateString = (ds) => {
    const date = new Date(ds * 1000);

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
          <CalendarTodayIcon/>
        </span>
        <span>{`${date.getMonth() +
          1}-${date.getDate()}-${date.getFullYear()}`}</span>
        <span
          style={{ fontSize: "15px", marginRight: "3px", marginLeft: "15px" }}
          className="material-icons"
        >
          <ScheduleIcon />
        </span>
        <span>{date.toLocaleTimeString()}</span>
        {/* <span>{`${date.getHours()}:${date.getMinutes()}`} UTC</span> */}
      </div>
    );
  };

  return (
    <div>
      {/* <img src={match.league.image_url} alt='' style={{width:'60px',borderRadius:"50%"}}/> */}
      <Grid style={{marginBottom: '20px'}} container spacing={3} alignItems="center" justify="center">
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
            {getDateString(match.firstHalfStart)}
          </Paper>
        </Grid>
        <Grid container xs={12} spacing={4}>
          <Grid item xs={12} md={6}>
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
              DETAILS
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
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
      </Grid>
      <MatchModal
        open={createModalOpen}
        setCreateModalOpen={setCreateModalOpen}
        match={match}
        contract={contract}
        account={account}
      />
      <MatchInfo
        open={createInfoModalOpen}
        setCreateModalOpen={setCreateInfoModalOpen}
        match={match}
        contract={contract}
        account={account}
      />
    </div>
  );
};

UpcomingMatchCard.propTypes = {
  match: PropTypes.object.isRequired,
};

export default UpcomingMatchCard;
