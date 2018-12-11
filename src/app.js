import React from 'react';
import Web3 from 'web3';
import config from './config.js';
import { abi as scpContractABI } from '../build/contracts/SecurePassphraseCheck.json';

class App extends React.Component {
    constructor(props) {
      super(props);
      this.state = { loading: true };
      this.web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
      this.web3.eth.getAccounts().then((accounts) => {
        this.setState({
          loading: !(accounts.length > 0 )
        });
      });
      this.setupContracts();
    }

    setupContracts() {
      this.scpContracct = new web3.eth.Contract(scpContractABI, config.spcContractAddress);
      // console.log(this.scpContracct.)
    }
  
    render() {
      if (this.state.loading) {
        return <p>Loading..</p>;
      }
      
      return (
        <button onClick={() => this.setState({ liked: true })}>
          Like
        </button>
      );
    }
  }

  export default App;