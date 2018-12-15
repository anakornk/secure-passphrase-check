import React from "react";
import { Link } from "react-router-dom";

class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    var that = this;
    this.props.spcContract.methods
      .numQuestions()
      .call()
      .then(res => {
        // this.setState({
        //     loading: false,
        //     numQuestions: res
        // });
        let latestQid = res - 1;
        if(latestQid < 0) {
          return;
        }
        this.props.spcContract.methods
          .getQuestionsFromRange(0, latestQid)
          .call()
          .then(res => {
            this.setState({
              loading: false,
              questions: res
            });
            console.log(res);
          })
          .catch(error => console.log(error));
      })
      .catch(error => console.log(error));
  }

  render() {
    if (this.state.loading) {
      return <div className="lds-dual-ring"></div>;
    }
    let questions = [];
    let qids = this.state.questions.qids;
    let questionsText = this.state.questions.questionsText;
    for (let i = qids.length - 1; i >= 0; i--) {
      let l = `/questions/${qids[i]}`;
      questions.push(
        <Link to={l} className="card card-zoom" key={i}>
          {qids[i]}. {this.props.web3.utils.toAscii(questionsText[i])}
        </Link>
      );
    }
    return (
      <div className="cards">
        <h1 className="center">Questions</h1>
        {questions}
      </div>
    );
  }
}

export default HomePage;
