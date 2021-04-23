import React, { Component } from "react";
import SmartBetContract from "./contracts/SmartBet.json";
import PriceConsumerV3 from "./contracts/PriceConsumerV3.json";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Upcoming from "./components/matches/Upcoming";
import MatchesShow from "./components/matches/MatchesShow";
import MatchesShowAdmin from "./components/matches/MatchesShowAdmin";
import Matches from "./components/matches/Matches";
import LandingPage from "./pages/LandingPage";
// import store from "./store";
import history from "./history";
import ContainerMain from "./components/layout/ContainerMain";
import Warning from "./components/NetworkWarning";
import Preloader from "./components/layout/Preloader";
import "./App.css";
import getWeb3 from "./getWeb3";



class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      web3: null, 
      accounts: null, 
      contract: null,
      isAdmin: true
    }
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();

      const smartBetAddress = '0x25c541238309c470b9a371419C7813aCFb24Ac16'; // address of deployed contract
      const priceContractAddress = '0xbA58fe54c9F2dd7882BF51B40F1A499F92DB3DC3'; // address of deployed contract
      
      // Get local deployment
      // const deployedNetwork = SmartBetContract.networks[networkId];
      // const instance = new web3.eth.Contract(
      //   SmartBetContract.abi,
      //   deployedNetwork && deployedNetwork.address,
      // );      

      // Get deployed contract instance.
      const instance = new web3.eth.Contract(SmartBetContract.abi,
        smartBetAddress);     
      
      // Get deployed contract instance.
      const priceFeedInstance = new web3.eth.Contract(PriceConsumerV3.abi,
        priceContractAddress);     

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, priceContract: priceFeedInstance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  // runExample = async () => {
  //   const { accounts, contract } = this.state;

  //   // Stores a given value, 5 by default.
  //   await contract.methods.set(5).send({ from: accounts[0] });

  //   // Get the value from the contract to prove it worked.
  //   const response = await contract.methods.get().call();

  //   // Update state with the result.
  //   this.setState({ storageValue: response });
  // };

  resolveAdmin =()=>{

  }

  render() {
    if (!this.state.web3) {
      return <Preloader />;
    }
    return (
      <div className="App">
        <Router forceRefresh history={history}>
          <Navbar account={this.state.accounts[0]} />
          <Route exact path="/" component={LandingPage} />
          <ContainerMain>
            <Switch>
              <Route exact path="/matches" render={props => {return <Matches {...props} baseAppState={this.state} /> }} />
              <Route exact path="/matches/:id" render={props => {return <MatchesShow {...props} baseAppState={this.state} /> }} />
              <Route exact path="/warning" render={props => {return <Warning {...props} baseAppState={this.state} /> }} />
              
              {/* only admin */}
              <Route exact path="/upcoming" render={props => {return(this.state.isAdmin ? <Upcoming {...props} baseAppState={this.state} />  : <Redirect to="/matches"/> )} } />
              <Route exact path="/matches/:id/admin" render={props => {return(this.state.isAdmin ? <MatchesShowAdmin {...props} baseAppState={this.state} />  : <Redirect to="/matches"/> )} } />              

              {/* <Route exact path="/*" component={Matches} /> */}

            </Switch>
          </ContainerMain>
        </Router>
      </div>
    );
  }
}

export default App;
