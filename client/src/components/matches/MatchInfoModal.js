import React from "react";
import {
  Button,
  Grid,
  makeStyles,
  Modal,
  Paper,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@material-ui/core";
import Avt from "../layout/AvatarImg";

function MatchInfoModal({ open, setCreateModalOpen, match }) {
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
  //   console.log(match);

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
        {/* <Grid item xs={6} style={{ fontSize: "15px", fontWeight: "bold" , textAlign:"center"}}>
                    {opp.name}
                </Grid> */}
      </div>
    );
  };
  //   console.log(match.official_stream_url);

  const infoTable = () => {
    return (
      <TableContainer>
        <Table
          style={{
            marginTop: "15px",
            border: "1px #515151 solid",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: "bold" }}>League Name</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>League ID</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>
                Streaming URL
              </TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{match.league.name}</TableCell>
              <TableCell>{match.league.id}</TableCell>
              <TableCell>
                <a
                  href={match.official_stream_url}
                  target="_blank"
                  style={{ color: "orangered" }}
                >
                  Twitch Link
                </a>
              </TableCell>
              <TableCell>{match.match_type}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

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
          ABOUT GAME
        </span>
        <Paper className={classes.paper} elevation={0}>
          <Grid container spacing={3} alignItems="center" justify="center">
            <Grid
              item
              xs={12}
              style={{
                fontWeight: "bold",
                fontSize: "18px",
                color: "yellowgreen",
              }}
            >
              {match.videogame.name}
            </Grid>
            <Grid item xs={5}>
              {getImage(0)}
            </Grid>
            <Grid item xs={2}>
              VS
            </Grid>
            <Grid item xs={5}>
              {getImage(1)}
            </Grid>
          </Grid>

          {infoTable()}
        </Paper>
      </div>
    </Modal>
  );
}

const modalStyle = {
  position: "absolute",
  top: "20%",
  margin: "auto",
  backgroundColor: "#424242",
  width: "50%",
  height: "58%",
  padding: "10px",
};

export default MatchInfoModal;
