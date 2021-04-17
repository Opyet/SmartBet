import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import CusAvatar from "../layout/CustomizedAvatar";
import {Avatar} from "@material-ui/core";

const TeamImage = (props) => {

    const [isSelected, setSelected] = useState(props.isSelected);
    const [isWinner, setWinTeamIndex] = useState(null);  
    
    const onSelectBet= ()=>{
      setSelected(isSelected);
      if(!isSelected){
        console.log('internal selected: team ', props.teamIndex);
        props.onSelectBetCallback(props.teamIndex);
      }      
    }

    useEffect(() => {
        
        if(props.match.goalsHomeTeam > props.match.goalsAwayTeam){
            setWinTeamIndex(0);
        }else if(props.match.goalsHomeTeam < props.match.goalsAwayTeam){
            setWinTeamIndex(1);
        }else{
            setWinTeamIndex(2);
        }
      }, []);

    useEffect(() => {
      setSelected(props.isSelected);
    }, [props.isSelected]);

    let team = null;

    if(props.teamIndex === 0){
      team = props.match.homeTeam;
    }
    if(props.teamIndex === 1){
      team = props.match.awayTeam;
    } 

    const colors = ["#ff2e2e", "#3877ff"];
    const avatarStyle = {
      width: "196px",
      height: "196px",
      backgroundColor: colors[props.teamIndex],
      fontSize: "72px",
      color: "#ffffff",
      cursor: "pointer",
    };

    

    let winTag = {
      height: isWinner ? "5vw" : "0vw",
      width: isWinner ? "5vw" : "0vw",
      position: "absolute",
      zIndex: "100000",
      bottom: "0px",
      right: "0px",
      display: "block",
    };

    const borderStyle = props.match.ended
      ? {
          padding: isWinner ? "10px" : "15px",
          border: isWinner ? `5px #FFD700 solid` : "none",
        }
      : {
          padding: isSelected ? "5px" : "10px",
          border: isSelected ? `5px ${colors[props.teamIndex]} dashed` : "none",
        };

    // const handleSelection = () => {
    //   onSelectBet();      
    // };

    let avatar;
    if (!team.logo) {
      avatar = (
        <div onClick={()=>onSelectBet()} style={{ ...borderStyle }}>
          <Avatar
            variant="rounded"
            style={{ ...avatarStyle, position: "relative" }}
          >
            {props.match.ended && isWinner === props.teamIndex ? (
              <img
                src={process.env.PUBLIC_URL + "/images/winnerTag.png"}
                style={winTag}
              />
            ) : (
              <></>
            )}
            {team.name[0]}
          </Avatar>
        </div>
      );
    } else {
      avatar = (
        <div onClick={()=>onSelectBet()} style={borderStyle}>
          {props.match.ended && isWinner === props.teamIndex ? (
            <CusAvatar
              variant="rounded"
              style={{ ...avatarStyle, position: "relative" }}
              src={team.logo}
              otherChild={
                <img
                  src={process.env.PUBLIC_URL + "/images/winnerTag.png"}
                  style={{ ...winTag }}
                />
              }
            ></CusAvatar>
          ) : (
            <Avatar
              variant="rounded"
              style={{ ...avatarStyle, position: "relative" }}
              src={team.logo}
            ></Avatar>
          )}
        </div>
      );
    }

    return (
      <React.Fragment>
        {avatar}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "196px",
            marginTop: "20px",
          }}
        >
          <span style={{ fontSize: "18px" }}>{team.team_name} {props.teamIndex === 0 ? " (Home)" : " (Away)"}</span>
          <span style={{ fontSize: "21px", fontWeight: "bold" }}>
            {props.teamIndex === 0 ? props.match.oddsA / 100 : props.match.oddsB / 100}
          </span>
        </div>
      </React.Fragment>
    );
};

export default TeamImage;