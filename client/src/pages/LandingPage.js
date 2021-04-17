import React from "react";
import { Grid, Button } from "@material-ui/core";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div style={{ marginTop: "150px" }}>
      <Grid style={{ width: "90%", margin: "auto" }} container>
        <Grid
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          item
          sm={5}
        >
          <div style={{ marginLeft: "20px", marginBottom: "35px" }}>
            <h1 style={{ margin: "0px" }}>
              THE SMART WAY TO BET AND EARN MORE
            </h1>
            <p style={{ fontWeight: "lighter" }}>
              Bet on outcome of live matches from all around the globe.
              By hodling your NFTs, you can earn more.
            </p>
            <Link style={{ textDecoration: "none" }} to="/matches">
              <Button
                variant="contained"
                size="large"
                style={{ color: "white", background: "#202020" }}
              >
                START BETTING
              </Button>
            </Link>
          </div>
        </Grid>
        <Grid
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          item
          sm={7}
        >
          <img
            alt="Landing page"
            width="90%"
            style={{ opacity: 0.9 }}
            src={process.env.PUBLIC_URL + "/images/landing.svg"}
          />
        </Grid>
      </Grid>
    </div>
  );
};
export default LandingPage;
