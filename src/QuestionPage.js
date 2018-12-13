import React from "react";
class QuestionPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      textValue: ""
    };
    props.spcContract.methods
      .getQuestion(props.match.params.id)
      .call()
      .then(res => {
        this.setState({
          loading: false,
          question: res
        });
        console.log(res);
      })
      .catch(error => console.log(error));

    // bind this
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

    var answer = this.state.textValue;
    var web3 = this.props.web3;
    var answerPrivateKey = web3.utils.keccak256(answer);
    var a = new web3.utils.BN(this.props.account.substr(2), 16);
    var { signature } = web3.eth.accounts.sign(a.toBuffer(), answerPrivateKey);
    this.props.spcContract.methods
      .checkAnswer(this.props.match.params.id, signature)
      .call({ from: this.props.account })
      .then(res => {
        console.log(res);

        if (res) {
          this.props.spcContract.methods
            .submit(this.props.match.params.id, signature)
            .send({ from: this.props.account })
            .on("transactionHash", function(hash) {
              console.log(hash);
            })
            .on("receipt", function(receipt) {
              console.log(receipt);
            })
            .on("confirmation", function(confirmationNumber, receipt) {
              console.log(confirmationNumber, receipt);
            })
            .on("error", console.error);
        }
      });
  }

  handleChange(event) {
    this.setState({ textValue: event.target.value });
  }

  render() {
    if (this.state.loading) {
      return <p>Loading..</p>;
    }
    let isWinner = this.state.question.winners.includes(this.props.account);
    let winners = this.state.question.winners.map(function(winner, index){
      return <p key={index}>{winner}</p>
    });
    return (
      <div className="form-wrapper">
        <h1 className="center">{this.props.web3.utils.toAscii(this.state.question.questionText)}</h1>
        { !isWinner &&
          <form onSubmit={this.handleSubmit}>
            <label>
              Answer:
              <input
                type="text"
                value={this.state.textValue}
                onChange={this.handleChange}
              />
            </label>
            <input type="submit" value="Submit" />
          </form>
        }
        { isWinner &&
          <form onSubmit={this.handleSubmit}>
            <h2>You are a winner!</h2>
            <input type="submit" value="Claim Your Prize Now" />
          </form>
        }
        <div id="winners">
          <h2>Winners</h2>
          <p>{this.state.question.numWinners} / {this.state.question.maxWinners} </p>
          <p>{winners}</p>
        </div>
      </div>
    );
  }
}

export default QuestionPage;
