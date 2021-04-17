import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Grid, Paper, Button } from "@material-ui/core";
import Avt from "../layout/AvatarImg";
import "../../App.css";
import Preloader from "../layout/Preloader";
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import CasinoIcon from '@material-ui/icons/Casino';

export const MatchCard = ({ match, contract, account }) => {
  const [apiData, setApiData] = useState(match);
  const [myBet, setMyBet] = useState(null);

  // const { apiUrl } = match;

  useEffect(() => {
    (async () => {
      contract.getPastEvents('BetPlacedEvent', {
        filter: {bettor: account, matchId: match.matchId},
        fromBlock: 0,
        toBlock: 'latest'
        }, (error, events) => {
          if(!error){
            if(events){
              console.log('bets placed by user', events);
              setMyBet(events);
            }
          }else{
            console.log('fetch bet error', error);
          }
      })
      // setApiData(res.data);
    })();
  }, []);

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

  if (apiData === null) return <Preloader />;

  return (
    <div>
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
            <div style={{ display: "flex", justifyContent: "center" }}>
              { match.ended ? ( //match.statusShort === 'FT'
                <span style={{ color: "red", fontWeight: "bold" }}>CLOSED</span>
              ) : (
                <>
                  <Grid container xs={12} spacing={5}>
                    <Grid item xs={4}>
                      <span
                        style={{ fontSize: "20px", marginRight: "5px" }}
                        className="material-icons"
                      >
                        <CasinoIcon />
                      </span>
                      <span
                        style={{ fontSize: "15px", fontWeight: "bold", position: 'relative', top: '-5px' }}
                      >{`Win ${match.oddsA / 100}`}</span>
                    </Grid>
                    <Grid item xs={4}>
                      <span
                        style={{ fontSize: "20px", marginRight: "5px" }}
                        className="material-icons"
                      >
                        <CasinoIcon />
                      </span>
                      <span
                        style={{ fontSize: "15px", fontWeight: "bold", position: 'relative', top: '-5px' }}
                      >{`Draw ${match.oddsDraw / 100}`}</span>
                    </Grid>
                    <Grid item xs={4}>
                      <span
                        style={{ fontSize: "20px", marginRight: "5px" }}
                        className="material-icons"
                      >
                        <CasinoIcon />
                      </span>
                      <span
                        style={{ fontSize: "15px", fontWeight: "bold", position: 'relative', top: '-5px' }}
                      >{`Win ${match.oddsB / 100}`}</span>
                    </Grid>
                  </Grid>
                </>
              )}
              {/* <span
                style={{
                  fontSize: "20px",
                  marginLeft: "25px",
                  marginRight: "5px",
                }}
                className="material-icons"
              >
                <AccountBalanceIcon />
              </span>
              <span style={{ fontSize: "15px" }}>
                {(match.totalCollection / 10 ** 18).toFixed(2)}{" "}                
              </span> */}
            </div>
          </Paper>
        </Grid>
        
        {match.ended || match.started ? null
        // {myBet && myBet.length > 0 ?
          // <Grid item xs={12}>
          //   <Link to={`/matches/${btoa(match.matchId)}`}>
          //     <Button
          //       style={{
          //         backgroundColor: "#357a38",
          //         color: "#ffffff",
          //         fontWeight: "bold",
          //       }}
          //       variant="contained"
          //       fullWidth
          //     >
          //       VIEW BET
          //     </Button>
          //   </Link>
          // </Grid>
        :
        <Grid item xs={12}>
          <Link to={`/matches/${btoa(match.matchId)}`}>
            <Button
              style={{
                backgroundColor: "#357a38",
                color: "#ffffff",
                fontWeight: "bold",
              }}
              variant="contained"
              disabled={match.ended}
              fullWidth
            >
              PLACE BET
            </Button>
          </Link>
        </Grid>}
      </Grid>
    </div>
  );
};

export default MatchCard;