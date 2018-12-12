import React from 'react';
import Web3 from 'web3';
import config from './config.js';
import { abi as spcContractABI } from '../build/contracts/SecurePassphraseCheck.json';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

const Index = () => <h2>Home</h2>;
const About = () => <h2>About</h2>;
const Users = () => <h2>Users</h2>;

class App extends React.Component {
    constructor(props) {
      super(props);
      this.state = { loading: true };
      this.web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
      this.web3.eth.getAccounts().then((accounts) => {
        this.setState({
          loading: !(accounts.length > 0 ),
          accounts
        });
      });
      this.setupContracts();
    }

    setupContracts() {
      this.spcContract = new this.web3.eth.Contract(spcContractABI, config.spcContractAddress);
      // console.log(this.spcContract.methods.numQuestions.call)
      this.spcContract.methods.numQuestions().call().then((res) => {
        console.log(res);
      }).catch((error) => console.log(error));
    }
  
    render() {
      if (this.state.loading) {
        return <p>Loading..</p>;
      }
      
      return (
        <Router>
          <div>
            <nav>
              <ul>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/about/">About</Link>
                </li>
                <li>
                  <Link to="/users/">Users</Link>
                </li>
              </ul>
            </nav>
            <Route path="/" exact component={Index} />
            <Route path="/about/" component={About} />
            <Route path="/users/" component={Users} />
          </div>
        </Router>
      );
    }
  }

  export default App;