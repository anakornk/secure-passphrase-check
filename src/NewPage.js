import React from "react";
import { Redirect } from "react-router-dom";
class NewPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      question: "",
      answer: "",
      max: 1,
      isMined: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    // submit
    let question = this.state.question;
    let answer = this.state.answer;
    let web3 = this.props.web3;
    let account = this.props.account;
    let spcContract = this.props.spcContract;

    let answerPrivateKey = web3.utils.keccak256(answer);
    var answerAddress = web3.eth.accounts.privateKeyToAccount(answerPrivateKey).address;

    var that = this;

    spcContract.methods
      .newQuestion(web3.utils.fromAscii(question), answerAddress, 1)
      .send({ from: account })
      .then(function(receipt){
        console.log(receipt);
        that.setState({isMined: true});
      })
      .catch(console.error);
  }

  render() {
    return (
      <div className="form-wrapper">
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
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

export default NewPage;
