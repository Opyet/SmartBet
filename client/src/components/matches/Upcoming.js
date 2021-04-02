import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Match from "./UpcomingMatchCard";
import Preloader from "../layout/Preloader";
import PropTypes from "prop-types";
import { getMatches } from "../../actions/apiActions";

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

export const Upcoming = ({ api: { matches, loading }, getMatches }) => {
  const classes = useStyles();
  useEffect(() => {
    getMatches();
    //eslint-disable-next-line
  }, []);

  if (loading || matches === null) {
    return <Preloader />;
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        {!loading && matches.length === 0 ? (
          <p className="center">No Matches to show....</p>
        ) : (
          matches.map((match, index) =>
            match.opponents.length == 2 ? (
              <Grid key={index} item xs={12} sm={6}>
                <Paper className={classes.paper} elevation={2}>
                  <Match match={match} />
                </Paper>
              </Grid>
            ) : (
              <React.Fragment key={index}></React.Fragment>
            )
          )
        )}
      </Grid>
    </div>
  );
};

Upcoming.propTypes = {
  api: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  api: state.api,
});

export default connect(mapStateToProps, { getMatches })(Upcoming);
