import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { connectWeb3 } from "../../actions/web3Actions";
import { Paper, Menu, MenuItem } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginBottom: "20px",
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  btn: {
    backgroundColor: "inherit",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
    "&:click": {
      backgroundColor: "inherit",
    },
  },
}));
const Navbar = ({ connectWeb3, network, account }) => {
  useEffect(() => {
    connectWeb3(-1);
  }, []);

  const loc = useLocation().pathname;

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMetamask = () => {
    setAnchorEl(null);
    connectWeb3(1);
  };

  const handlePortisMatic = () => {
    setAnchorEl(null);
    connectWeb3(2);
  };

  const handlePortisKovan = () => {
    setAnchorEl(null);
    connectWeb3(3);
  };

  const classes = useStyles();
  return (
    <div className={classes.root}>
      <AppBar
        style={{ backgroundColor: "#303030" }}
        elevation={loc === "/" ? 0 : 1}
      >
        <div style={{ width: "90%", margin: "auto" }}>
          <Toolbar>
            <Typography
              style={{
                display: "flex",
                alignItems: "center",
                justify: "center",
              }}
              variant="h6"
              className={classes.title}
            >
              <img
                style={{ marginRight: "15px" }}
                width="28"
                alt="brand"
                src={process.env.PUBLIC_URL + "/images/brand.svg"}
              />
              <Link style={{ color: "white" }} to="/">
                DREAM ARENA
              </Link>
            </Typography>
            <Link to="/matches">
              <Button
                style={
                  loc.includes("matches")
                    ? {
                        backgroundColor: "#4aedc4",
                        color: "black",
                        marginRight: "10px",
                      }
                    : { marginRight: "10px", color: "white" }
                }
                className={classes.btn}
              >
                <span>Matches</span>
              </Button>
            </Link>
            <Link to="/upcoming">
              <Button
                style={
                  loc.includes("upcoming")
                    ? { backgroundColor: "#4aedc4", color: "black" }
                    : { color: "white" }
                }
                className={classes.btn}
              >
                <span>Upcoming</span>
              </Button>
            </Link>
            <Paper
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "4px 12px",
                fontWeight: "bold",
                marginLeft: "10px",
              }}
            >
              {network !== 42 && network !== 80001 ? (
                "CHECKING NETWORK.."
              ) : (
                <>
                  {" "}
                  <span
                    style={{
                      color: network === 42 ? "#0f71b7" : "#5DD395",
                      fontSize: "18px",
                      marginRight: "10px",
                    }}
                    className="material-icons"
                  >
                    fiber_manual_record
                  </span>
                  {network === 42 ? (
                    <img
                      src={process.env.PUBLIC_URL + "/images/eth.png"}
                      width="32"
                    />
                  ) : (
                    <img
                      src={process.env.PUBLIC_URL + "/images/matic.png"}
                      width="32"
                      style={{ marginRight: "3px" }}
                    />
                  )}{" "}
                  {network === 42 ? "ETHEREUM KOVAN" : "MATIC NETWORK"}{" "}
                </>
              )}
            </Paper>
            <Paper
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "8px 12px",
                fontWeight: "bold",
                marginLeft: "10px",
                cursor: "pointer",
              }}
              onClick={handleClick}
            >
              <span className="material-icons">account_balance_wallet</span>
              <span className="material-icons">arrow_drop_down</span>
              <span>{account && account.slice(0, 10)}...</span>
            </Paper>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              getContentAnchorEl={null}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <MenuItem onClick={handleMetamask}>Connect Metamask</MenuItem>
              <MenuItem onClick={handlePortisMatic}>
                Connect Portis (Matic)
              </MenuItem>
              <MenuItem onClick={handlePortisKovan}>
                Connect Portis (Kovan)
              </MenuItem>
            </Menu>
          </Toolbar>
        </div>
      </AppBar>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    network: state.ethereum.network,
    account: state.ethereum.account,
  };
};

export default connect(mapStateToProps, { connectWeb3 })(Navbar);
