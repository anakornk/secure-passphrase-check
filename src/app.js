import React from "react";
import Web3 from "web3";
import config from "./config.js";
import { abi as spcContractABI } from "../build/contracts/SecurePassphraseCheck.json";
import { abi as prizeCreatorABI } from "../build/contracts/PrizeCreator.json";
import HomePage from "./HomePage";
import NewPage from "./NewPage";
import QuestionPage from "./QuestionPage";
import MePage from "./MePage";
import "./app.css";
import { HashRouter, Route, NavLink } from "react-router-dom";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
    // this.web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    // this.web3.eth.getAccounts().then(accounts => {
    //   this.setState({
    //     loading: !(accounts.length > 0),
    //     account: accounts[0]
    //   });
    // });
    this.setUpWeb3();
    // this.setupContracts();
  }

  setupContracts() {
    this.spcContract = new this.web3.eth.Contract(
      spcContractABI,
      config.spcContractAddress
    );
    this.prizeCreator = new this.web3.eth.Contract(
      prizeCreatorABI,
      config.prizeCreatorAddress
    );
    this.setUpAccount();
  }

  setUpAccount() {
    var that = this;
    var accountInterval = setInterval(function() {
      // if (web3.eth.accounts[0] !== account) {
      //   account = web3.eth.accounts[0];
      //   updateInterface();
      // }
      that.web3.eth.getAccounts().then(accounts => {
        if(accounts.length > 0){
          that.setState({
            loading: false,
            account: accounts[0]
          });
        } else {
          that.setState({loading: true})
          console.log("no account / please unlock")
        }
      });
    }, 100);



  }

  setUpWeb3() {
    this.web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    if(this.web3.currentProvider.isMetaMask){
      ethereum.enable().then(()=>{
        // Accounts now exposed
        this.setupContracts();
      });
    } else {
      this.setupContracts();
    }
   

    // if (window.ethereum) {
    //   this.web3 = new Web3(ethereum);
    //   try {
    //       // Request account access if needed
    //       await ethereum.enable();
    //       // Acccounts now exposed

          
    //   } catch (error) {
    //       // User denied account access...
    //       console.log(error);
    //   }
    // }
    // // Legacy dapp browsers...
    // else if (window.web3) {
    //   this.web3 = new Web3(Web3.givenProvider);
    //   new Web3(Web3.givenProvider || "ws://localhost:8545")
    //   // Acccounts always exposed
    // }
    // // Non-dapp browsers...
    // else {
    //   console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    // }
  }

  render() {
    if (this.state.loading) {
      return <div className="lds-dual-ring"></div>;
    }

    return (
      <HashRouter>
        <div>
          <nav>
            <ul>
              <li>
                <NavLink exact to="/">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/new">New Question</NavLink>
              </li>
              <li>
                <NavLink to="/me">My Questions</NavLink>
              </li>
            </ul>
          </nav>
          <Route
            path="/"
            exact
            render={props => (
              <HomePage
                {...props}
                web3={this.web3}
                spcContract={this.spcContract}
              />
            )}
          />
          <Route
            path="/new"
            render={props => (
              <NewPage
                {...props}
                web3={this.web3}
                spcContract={this.spcContract}
                account={this.state.account}
              />
            )}
          />
          <Route
            path="/questions/:id"
            render={props => (
              <QuestionPage
                {...props}
                web3={this.web3}
                spcContract={this.spcContract}
                prizeCreator={this.prizeCreator}
                account={this.state.account}
              />
            )}
          />
          <Route
            path="/me"
            render={props => (
              <MePage
                {...props}
                web3={this.web3}
                spcContract={this.spcContract}
                account={this.state.account}
              />
            )}
          />
        </div>
      </HashRouter>
    );
  }
}

export default App;
