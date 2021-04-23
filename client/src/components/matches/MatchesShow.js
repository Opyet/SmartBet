import React, { Component } from 'react';
import { useParams } from "react-router-dom";
import CusAvatar from "../layout/CustomizedAvatar";
import APICall from '../../utils/APICall';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Avatar,
  Button,
  TextField,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@material-ui/core";
import Preloader from "../layout/Preloader";
import history from "../../history";
import TeamImage from "./TeamImage";


const cardHeader = {
  display: "flex",
  alignItem: "center",
  justifyContent: "space-between",
  fontWeight: "bold",
  margin: "0px",
  fontSize: "18px",
};
const cardStyle = { height: "95%", width: "100%" };
const gridItemStyle = {
  display: "flex",
  alignItems: "center",
  height: "100%",
  justifyContent: "center",
  flexDirection: "column",
};


class MatchesShow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: null, 
      account: null, 
      contract: null,
      priceContract: null,
      match: null,
      matchId:0,
      ONE_BNB: 0, //BUSDs
      PRICE_TO_BUSD: 0,
      betAmount: 0, 
      assets: [],
      winBetIndex: null,  //0-teamA  1-teamB 2-draw (frontend)
      betSelected: null,
      assetSelected: null,
      loading:[],
      loadingWithdraw:[]
    }

    this.setBetSelected = this.setBetSelected.bind(this);
    this.setLoadingWithdraw = this.setLoadingWithdraw.bind(this);
    this.setLoading = this.setLoading.bind(this);
    
  }

  componentWillMount() {
    if(this.props.baseAppState){
      this.setState({contract: this.props.baseAppState.contract});
      this.setState({account: this.props.baseAppState.accounts[0]});
      this.setState({priceContract: this.props.baseAppState.priceContract});
    }
    
  }

  componentDidMount() {
    let url = window.location.href;
    let n = url.lastIndexOf('/');
    let payload = url.substring(n + 1);
    let matchId = parseInt(atob(payload));    

    this.setState({matchId: matchId});
    
    if(!this.state.match){
      this.getMatch(matchId);
    }
    // if(this.state.ONE_BNB == 0){
    //   this.getBNBPriceFeed();
    // }
    this.getBNBPriceFeed();
    this.getSmartAssets(matchId);
  }

  // selectAsset=(assetId)=>event=>{
  //   event.preventDefault();
  // }

  getBNBPriceFeed = () =>{
    
    //TEST NET
    
    this.state.priceContract.methods.getLatestPrice().call({from: this.state.account})
    .then(result=>{
      console.log('pricefeed result', result);
        this.setState({ONE_BNB: (result/10000).toFixed(4)}, 
            console.log('price feed response', this.state.ONE_BNB))
    }).catch(error => {
        console.log('get bnb PriceFeed error', error);
    });
  }
 
  getSmartAssets =(matchId)=>{
    
    this.state.contract.getPastEvents('SmartAssetAwardedEvent', {
      filter: {awardee: this.state.account},
      fromBlock: 0,
      toBlock: 'latest'
      }, (error, events) => {       
        if(!error && events && events.length > 0){
          let assets = [];
          events.forEach(event => {
            let assetId = event.returnValues.smartAssetId;
            
            // get assets details
            this.state.contract.methods.getSmartAsset(assetId).call({from: this.state.account})
            .then(result=>{
              console.log('asset details', result);
              if(result){
                let betOn = null;
                if(result.matchResult == 2){//teamA
                  betOn = 0;
                } else if(result.matchResult == 3){//teamB
                  betOn = 1;
                } else if(result.matchResult == 1){//draw
                  betOn = 2;
                } else{}

                let asset = {
                  id: parseInt(assetId),
                  value: parseInt(result.initialValue),
                  matchId: parseInt(result.matchId),
                  betOn: betOn,
                  owner: this.state.account
                }
                assets.push(asset);
                this.setState({assets: assets});
              }
            }).catch(error=>{
              console.log(error);
            })
            
          });          
        }
    });    
  }

  getMatch =(matchId)=>{
    this.state.contract.methods.getMatch(matchId).call({from: this.state.account})
    .then(response => {
      if(response){
        console.log('getMatch', response);
        
        APICall(response.matchResultLink).then(result=>{
          console.log('match details', result);
          if(result){
            let match = result.api.fixtures[0];    
            match.id = matchId;  
            match.oddsA = response.oddsTeamA;
            match.oddsB = response.oddsTeamB;
            match.oddsDraw = response.oddsDraw;      
            if(!this.state.match){
              this.setState({match: match});
            }
          }
        }).catch(error=>{
          console.log(error);
        })
      }
    }).catch(error => {
      console.log('getMatch error', error);
    });
  }

  setLoadingClose(value){
    this.setState({loadingClose: [value]});
  }

  setLoadingWithdraw(value){
    this.setState({loadingWithdraw: [value]});
  }

  setBetAmount(value){
    this.setState({betAmount: value});
    let BUSDprice = value * this.state.ONE_BNB;
    this.setState({PRICE_TO_BUSD: BUSDprice});
  }

  setLoading(value){
    this.setState({loading: [value]});
  }

  setBetSelected(value){
    this.setState({betSelected: value},
      console.log('bet selected ', this.state.betSelected));    
  }

  render() {
    if (!this.state.match) {
      return <Preloader />;
    }

    const drawStyle = {
      backgroundColor: this.state.betSelected == 2 ? 'green': '',
      color: this.state.betSelected == 2 ? 'white': '',
    }
  
    // if (this.state.match.creator === this.state.account) {
    //   history.push(`/matches/${this.state.match.matchId}/admin`);
    // }
    
    return (
      <Grid style={{ height: "100%", position: 'relative', top: '-20px' }} container spacing={2} >
        <Grid style={gridItemStyle} item container xs={8}>
          <Card style={cardStyle}>
            <CardHeader
              title={
                <h5 style={cardHeader}>
                  <span>PLACE BET</span>
                  {this.state.match.ended && <span style={{ color: "red" }}>CLOSED</span>}
                </h5>
              }
            />
            <CardContent style={{ height: "100%", position: 'relative', top: '-30px' }}>
              <Grid style={{ height: "65%" }} container spacing={2}>
                <Grid style={gridItemStyle} item xs={5} container>
                  {this.state.match ? 
                  <TeamImage 
                    match={this.state.match} 
                    teamIndex={0} 
                    isSelected={this.state.betSelected == 0 ? true : false }
                    onSelectBetCallback={this.setBetSelected} 
                    /> 
                  : <Preloader />}
                </Grid>
                <Grid item xs={2} style={gridItemStyle} container>
                  VS
                  <div className={'place-bet-draw'} style={drawStyle} onClick={()=>this.setBetSelected(2)}>
                    <span style={{ fontSize: "16px", textAlign: 'center' }}>DRAW</span><br /> 
                    <span style={{ fontSize: "18px", fontWeight: "bold", textAlign: 'center' }}>
                      {this.state.match.oddsDraw / 100}
                    </span>                     
                  </div>
                </Grid>
                <Grid item xs={5} style={gridItemStyle} container>
                  {this.state.match ? 
                    <TeamImage 
                      match={this.state.match} 
                      teamIndex={1} 
                      isSelected={this.state.betSelected == 1 ? true : false }
                      onSelectBetCallback={this.setBetSelected} 
                      /> 
                    : <Preloader />}
                </Grid>
                <Grid item xs={12}>
                  <span className="busd-price"> ~ {new Intl.NumberFormat().format(this.state.PRICE_TO_BUSD.toFixed(2))} BUSD</span>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label={`Bet Amount in BNB`}
                    value={this.state.betAmount}
                    onChange={(e) => this.setBetAmount(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>                
                  <Button
                    onClick={()=>this.bet()}
                    style={{
                      backgroundColor: this.state.match.ended ? "#595959" : "#357a38",
                      color: !this.state.match.ended ? "#ffffff" : "#878787",
                      fontWeight: "bold",
                    }}
                    variant="contained"
                    fullWidth
                    disabled={this.state.match.ended}
                  >
                    {this.state.loading[0] ? (
                      <CircularProgress size={24} style={{ color: "white" }} />
                    ) : (
                      "PLACE BET"
                    )}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid style={gridItemStyle} item container xs={4}>
          <Card style={cardStyle}>
            <CardHeader title={<h5 style={cardHeader}>YOUR SMART ASSETS</h5>} />
            <CardContent
              style={{
                padding: "2px 15px",
                display: "flex",
                justifyContent: "space-between",
                flexDirection: "column",
                height: "calc(83% - 2px)",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: "bold" }}>No</TableCell>
                    <TableCell style={{ fontWeight: "bold" }}>Bet</TableCell>
                    <TableCell style={{ fontWeight: "bold" }}>NFT Value (BUSD)</TableCell>                    
                  </TableRow>
                </TableHead>
                
                <TableBody>
                  {this.state.assets && this.state.assets.length > 0 ?
                    this.state.assets.map((asset, index) =>{
                      
                      let bet = null;
                      if(asset.betOn === 0){
                        bet = 'Home';
                      }else if(asset.betOn === 1){
                        bet = 'Away';
                      }else if(asset.betOn === 2){
                        bet = 'Draw';
                      }

                      if(asset.matchId == this.state.matchId){
                        return(
                          <TableRow class="asset-list-item" key={index} onClick={()=>this.setState({assetSelected: asset.id})}>
                            <TableCell>{asset.id}</TableCell>
                            <TableCell>{bet}</TableCell>
                            <TableCell>~ {((asset.value / 10 ** 18) * this.state.ONE_BNB).toFixed(2)}</TableCell>                            
                          </TableRow>
                        )
                      }
                    })
                  : <Preloader /> }          
                </TableBody>
              </Table>
              <Button
                onClick={()=>this.withdrawPayout()}
                style={{ fontWeight: "bold" }}
                color="secondary"
                variant="contained"
                disabled={this.state.assetSelected ? false : true}
                fullWidth
              >
                {this.state.loadingWithdraw[0] ? (
                  <CircularProgress size={24} style={{ color: "white" }} />
                ) : (
                  "WITHDRAW PAYOUT (" + this.state.assetSelected +")"
                )}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  
  withdrawPayout = async () => {
    try {
      this.setLoadingWithdraw(true);

      this.state.contract.methods.liquidateAsset(this.state.assetSelected).send({        
        from: this.state.account
      }).then(result=>{
        console.log('liquidateAsset success',result);

        this.setLoadingWithdraw(false);
        // window.location.reload();
      }).catch(error=>{
        console.log(error);
        this.setLoadingWithdraw(false);
        // window.location.reload();
      });
        // window.location.reload();
    } catch (err) {
      alert(err.message);
    }

    this.setLoadingWithdraw(false);
  }

  bet = async () => {
    try {
      this.setLoading(true);
      let betOn = 0;

      // 1: draw     2: teamA   3: teamB
      if(this.state.betSelected == 0){//teamA
        betOn = 2;
      } else if(this.state.betSelected == 1){//teamB
        betOn = 3;
      } else if(this.state.betSelected == 2){//draw
        betOn = 1;
      }else{
        alert("invalid bet selection");
        this.setLoading(false);
        return;
      }

      console.log("Bet amount", this.state.betAmount * 10 ** 18);
      this.state.contract.methods.placeBet(this.state.match.id, betOn).send({
        value: parseInt(this.state.betAmount * 10 ** 18),
        from: this.state.account,
      }).then(result=>{
        console.log('placebet success',result);

        this.setLoading(false);
        window.location.reload();
      }).catch(error=>{
        console.log(error);
        this.setLoading(false);
        window.location.reload();
      });

      
    } catch (err) {
      alert(err.message);
      console.log(err);
    }

    this.setLoading(false);
  }

  
}

export default MatchesShow;