import React from 'react';
import Web3 from 'web3';
import config from './config.js';
import { abi as spcContractABI } from '../build/contracts/SecurePassphraseCheck.json';
import HomePage from './HomePage';
import NewPage from './NewPage';
import QuestionPage from './QuestionPage';
import queryString from 'query-string';

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

      let params = queryString.parseUrl(window.location.href).query;
      console.log(params);
      let page;
      if(params.page == "new"){
        page = <NewPage spcContract={this.spcContract}/>
      } else if(params.page == "question" && parseInt(params.qid) >= 0) {
        page = <QuestionPage web3={this.web3} spcContract={this.spcContract} qid={params.qid} />
      } else {
        page = <HomePage spcContract={this.spcContract}/>
      }
      return (
        <div>
          <nav>
            <ul>
              <li>
                <a href="/?page=home">Home</a>
              </li>
              <li>
                <a href="/?page=new">New</a>
              </li>
            </ul>
          </nav>
          { page }
        </div>
      );
    }
  }

  export default App;