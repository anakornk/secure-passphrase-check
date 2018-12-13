import React from "react";
import Web3 from "web3";
import config from "./config.js";
import { abi as spcContractABI } from "../build/contracts/SecurePassphraseCheck.json";
import HomePage from "./HomePage";
import NewPage from "./NewPage";
import QuestionPage from "./QuestionPage";
import "./app.css";
import { HashRouter, Route, NavLink } from "react-router-dom";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
    this.web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    this.web3.eth.getAccounts().then(accounts => {
      this.setState({
        loading: !(accounts.length > 0),
        account: accounts[0]
      });
    });
    this.setupContracts();
  }

  setupContracts() {
    this.spcContract = new this.web3.eth.Contract(
      spcContractABI,
      config.spcContractAddress
    );
  }

  render() {
    if (this.state.loading) {
      return <p>Loading..</p>;
    }

    // let params = queryString.parse(window.location.href.split('#')[1])
    // let page;
    // if(params.page == "new"){
    //   page = <NewPage web3={this.web3} spcContract={this.spcContract} account={this.state.account}/>
    // } else if(params.page == "question" && parseInt(params.qid) >= 0) {
    //   page = <QuestionPage web3={this.web3} spcContract={this.spcContract} qid={params.qid} account={this.state.account}/>
    // } else {
    //   page = <HomePage web3={this.web3} spcContract={this.spcContract}/>
    // }

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
                <NavLink to="/new">New</NavLink>
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
