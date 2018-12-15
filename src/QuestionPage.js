import React from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { abi as prizeABI } from "../build/contracts/Prize.json";

class QuestionPage extends React.Component {
  showError() {
    toast.error("Wrong Answer!", {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 1500
    });
  } 

  showSuccess() {
    toast.success("You are correct!", {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 1500
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      answer: "",
      onClick: false,
      prize: "eth",
      erc20Address: "",
      qId: props.match.params.id,
      hasPrize: false,
    };
   
    props.spcContract.methods
    .getQuestion(this.state.qId)
    .call()
    .then(res => {
      this.setState({
        loading: false,
        question: res
      });
      console.log(res);
    })
    .catch(error => console.log(error));




    props.prizeCreator.methods
    .getPrizeAddress(props.match.params.id)
    .call()
    .then(res => {
      let prizeAddress = res;
      if(prizeAddress == '0x0000000000000000000000000000000000000000'){
        return;
      }
      this.prize = new this.props.web3.eth.Contract(
        prizeABI,
        prizeAddress
      );
      this.prize.methods.getPrize().call().then(res => {
        this.setState({
          hasPrize: true,
          prize: res,
          prizeAddress
        });
        console.log(res);
      })
      .catch(error => console.log(error));

    })
    .catch(error => console.log(error));

    // bind this
    this.handleChange = this.handleChange.bind(this);
    this.submitAnswer = this.submitAnswer.bind(this);
    this.addPrize = this.addPrize.bind(this);
    this.claimPrize = this.claimPrize.bind(this);
  }

  submitAnswer(event) {
    event.preventDefault();
    
    this.setState({onClick: true})
    var answer = this.state.answer;
    var web3 = this.props.web3;
    var answerPrivateKey = web3.utils.keccak256(answer);
    var a = new web3.utils.BN(this.props.account.substr(2), 16);
    var { signature } = web3.eth.accounts.sign(a.toBuffer(), answerPrivateKey);
    this.props.spcContract.methods
      .checkAnswer(this.state.qId, signature)
      .call({ from: this.props.account })
      .then(res => {
        console.log(res);

        if (res) {
          this.props.spcContract.methods
            .submit(this.state.qId, signature)
            .send({ from: this.props.account })
            .then((receipt) => {
              console.log(receipt);
              // update old data without fetching new data
              let tempQuestion = Object.assign({}, this.state.question);
              tempQuestion.winners.push(this.props.account);
              tempQuestion.numWinners++;
              this.setState({
                question: tempQuestion,
                onClick: false
              })
              this.showSuccess();
            })
            .catch(console.error);
        } else {
          // show error
          this.setState({onClick: false});
          this.showError();
        }
      });
  }

  addPrize(event) {
    event.preventDefault();
    let prizeCreator = this.props.prizeCreator;
    let account = this.props.account;
    
    let qId = this.state.qId
    let prize = this.state.prize;
    let symbol = this.state.symbol;
    let erc20Address = this.state.erc20Address;

    if(prize == "eth") {
      console.log("eth"); 

      prizeCreator.methods.createETHPrize(qId).send({from: account})
      .then((receipt)=> {
        console.log(receipt);
        this.setState({onClick: false});
        location.reload();
      })
      .catch((err) => {
        console.log(err);
        // show error
        this.setState({onClick: false});
      });
    } else if(prize == "erc20") {
      console.log("Erc20");
      prizeCreator.methods.createERC20Prize(qId, erc20Address, symbol).send({from: account})
      .then((receipt)=> {
        this.setState({onClick: false});
        location.reload();
      })
      .catch((err) => {
        console.log(err);
        // show error
        this.setState({onClick: false});
      });
    }
  }

  claimPrize(event) {
    event.preventDefault();
    this.prize.methods
    .claim()
    .send({ from: this.props.account })
    .then(res => {
      console.log(res.events.Claim.returnValues);
      location.reload();
    })
    .catch(error => console.log(error));

  }

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  render() {
    if (this.state.loading) {
      return <div className="lds-dual-ring"></div>;
    }
    let isWinner = this.state.question.winners.includes(this.props.account);
    let winners = this.state.question.winners.map(function(winner, index){
      return <p key={index}>{winner}</p>
    });
    return (
      <div className="form-wrapper">
        <ToastContainer/>
        { this.state.onClick && <div className="lds-dual-ring"></div> }
        <h1 className="center">{this.props.web3.utils.toAscii(this.state.question.questionText)}</h1>
        { this.state.question.creator == this.props.account && !this.state.hasPrize &&
          <form onSubmit={this.addPrize}>
            <div className="radio-group">
              Prize Type:&nbsp;
              <label>
                <input
                  type="radio"
                  name="prize"
                  value="eth"
                  checked={this.state.prize == "eth"}
                  onChange={this.handleChange} />
                  ETH
              </label>
              &nbsp;
              <label>
                <input
                  type="radio"
                  name="prize"
                  value="erc20"
                  checked={this.state.prize == "erc20"}
                  onChange={this.handleChange} />
                  ERC20
              </label>
            </div>
            { this.state.prize == "erc20" && 
              <div>
                <label>
                  <input
                    type="text"
                    name="erc20Address"
                    placeholder="Contract Address e.g. 0x123456789"
                    checked={this.state.erc20Address}
                    onChange={this.handleChange} />
                </label>
                <label>
                  <input
                    type="text"
                    name="symbol"
                    placeholder="Token Symbol e.g. USDT"
                    checked={this.state.erc20Address}
                    onChange={this.handleChange} />
                </label>
              </div>
            }
            <input type="submit" value="Add Prize" />
          </form>
        }
        { this.state.hasPrize &&
          <div className="card card-col">
            <h2>Prize:  {this.state.prize.symbol == "WEI" ? this.props.web3.utils.fromWei(this.state.prize.value) : this.state.prize.value} {this.state.prize.symbol}</h2>
            { this.state.question.creator == this.props.account && 
              <p
              >To add prize, send {this.state.prize.symbol} to the prize address below
              </p>
            }
            <p>Prize address: {this.state.prizeAddress}</p>
          </div>
        }
        { !isWinner &&
          <form onSubmit={this.submitAnswer}>
            <label>
              Answer:
              <input
                type="text"
                name="answer"
                value={this.state.answer}
                onChange={this.handleChange}
              />
            </label>
            <input type="submit" value="Submit" disabled={this.state.answer.length == 0}/>
          </form>
        }
        { isWinner &&
          <form onSubmit={this.claimPrize}>
            <h2>You are a winner!</h2>
            { this.state.hasPrize &&
              <input type="submit" value="Claim Your Prize Now" />
            }
          </form>
        }
        <div className="card card-col">
          <h2>Winners</h2>
          <p>{this.state.question.numWinners} / {this.state.question.maxWinners} </p>
          <div>{winners}</div>
        </div>
      </div>
    );
  }
}

export default QuestionPage;
