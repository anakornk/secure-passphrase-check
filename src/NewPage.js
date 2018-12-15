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
      qId: -1
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
        console.log(receipt.events.NewQuestion.returnValues);
        let qId = receipt.events.NewQuestion.returnValues.qId;
        this.setState({isMined: true, onClick: false, qId});
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
        { this.state.isMined && <Redirect to={`/questions/${this.state.qId}`}/>}
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
          <input type="submit" value="Submit" disabled={this.hasEmptyInput()} />
        </form>
      </div>
    );
  }
}

export default NewPage;
