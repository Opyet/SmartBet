import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import MatchCard from "./MatchCard";
import Preloader from "../layout/Preloader";
import PropTypes from "prop-types";
import { getContractMatches } from "../../actions/matchesActions";

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

export const Matches = ({
  matches: { matches, loading },
  getContractMatches,
  contract,
}) => {
  const classes = useStyles();
  useEffect(() => {
    (async () => {
      if (contract) getContractMatches();
    })();
  }, [contract, getContractMatches]);

  if (loading) {
    return <Preloader />;
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        {matches.length === 0 ? (
          <p className="center">No Current Matches to show....</p>
        ) : (
          matches.map((match, index) => (
            <Grid key={index} item xs={12} sm={6}>
              <Paper className={classes.paper} elevation={2}>
                <MatchCard match={match} />
              </Paper>
            </Grid>
          ))
        )}
      </Grid>
    </div>
  );
};

Matches.propTypes = {
  matches: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  matches: state.matches,
  contract: state.ethereum.contract,
});

export default connect(mapStateToProps, { getContractMatches })(Matches);
