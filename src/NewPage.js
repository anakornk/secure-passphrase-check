import React from "react";
import { Redirect } from "react-router-dom";
class NewPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      question: "",
      answer: "",
      max: 1,
      isMined: false,
      onClick: false,
      addPrize: false,
      prize: "eth",
      erc20Address: ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.hasEmptyInput = this.hasEmptyInput.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    this.setState({onClick: true});
    // submit
    let question = this.state.question;
    let answer = this.state.answer;
    let web3 = this.props.web3;
    let account = this.props.account;
    let spcContract = this.props.spcContract;
    let prizeCreator = this.props.prizeCreator;

    let answerPrivateKey = web3.utils.keccak256(answer);
    var answerAddress = web3.eth.accounts.privateKeyToAccount(answerPrivateKey).address;

    spcContract.methods
      .newQuestion(web3.utils.fromAscii(question), answerAddress, 1)
      .send({ from: account })
      .then((receipt) => {
        console.log(receipt);
        if(this.state.addPrize) {
          if(this.state.prize == "eth") {
            console.log("eth");
            prizeCreator.methods.createETHPrize(0).send({from: account})
            .then((receipt)=> {
              this.setState({isMined: true, onClick: false});
            })
            .catch((err) => {
              console.log(err);
              // show error
              this.setState({onClick: false});
            });
          } else if(this.state.prize == "erc20") {
            console.log("Erc20");
            prizeCreator.methods.createERC20Prize(0, this.state.erc20Address, "TATA").send({from: account})
            .then((receipt)=> {
              this.setState({isMined: true, onClick: false});
            })
            .catch((err) => {
              console.log(err);
              // show error
              this.setState({onClick: false});
            });
          }
        }
      })
      .catch(console.error);
  }

  hasEmptyInput() {
    return (this.state.question.length == 0) || (this.state.answer.length == 0) || (this.state.max <= 0)
  }

  render() {
    return (
      <div className="form-wrapper">
        { this.state.onClick && <div className="lds-dual-ring"></div> }
        { this.state.isMined && <Redirect to="/me"/>}
        <h1 className="center">New Question</h1>
        <form onSubmit={this.handleSubmit}>
          <label>
            Question:
            <input
              type="text"
              name="question"
              value={this.state.question}
              onChange={this.handleChange}
              maxLength="32"
            />
          </label>
          <label>
            Answer:
            <input
              type="text"
              name="answer"
              value={this.state.answer}
              onChange={this.handleChange}
            />
          </label>
          <label>
            Number of Maximum Winners:
            <input
              type="number"
              name="max"
              value={this.state.max}
              onChange={this.handleChange}
            />
          </label>
          <label>
            Add Prize:
            <input
              type="checkbox"
              name="addPrize"
              checked={this.state.addPrize}
              onChange={this.handleChange} />
          </label>
          { this.state.addPrize && 
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="prize"
                  value="eth"
                  checked={this.state.prize == "eth"}
                  onChange={this.handleChange} />
                  ETH
              </label>
              <div>
                <label>
                  <input
                    type="radio"
                    name="prize"
                    value="erc20"
                    checked={this.state.prize == "erc20"}
                    onChange={this.handleChange} />
                    ERC20
                </label>
                <label>
                  <input
                    type="input"
                    name="erc20Address"
                    placeholder="Contract Address e.g. 0x123456789"
                    checked={this.state.erc20Address}
                    onChange={this.handleChange} />
                </label>
              </div>
            </div>
          }
          <input type="submit" value="Submit" disabled={this.hasEmptyInput()} />
        </form>
      </div>
    );
  }
}

export default NewPage;
