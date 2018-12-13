import React from 'react';
import { Link } from "react-router-dom";

class HomePage extends React.Component {
    constructor(props) {
        super(props);
        var that = this;
        this.props.spcContract.methods.numQuestions().call().then((res) => {
            // this.setState({
            //     loading: false,
            //     numQuestions: res
            // });
            let latestQid = res - 1;
            this.props.spcContract.methods.getQuestionsFromRange(0, latestQid).call()
            .then((res) => {
                this.setState({
                    loading: false,
                    questions: res
                })
                console.log(res)
            })
            .catch((error) => console.log(error));
        }).catch((error) => console.log(error));

        this.state = {
            loading: true,
        };
    }

    render() {
        if(this.state.loading) {
            return (
                <div>Loading..</div>
            )
        }

        let questions = [];
        let qids = this.state.questions.qids;
        let questionsText = this.state.questions.questionsText;
        for(let i=0; i < qids.length; i++) {
            let l = `/questions/${i}`;
            questions.push(
                <p key={i}><Link to={l}>{qids[i]} {this.props.web3.utils.toAscii(questionsText[i])}</Link></p>
            );
        }
        return (
            <div>
                <p>Questions:</p>
                { questions }
            </div>
        );
    }
}

export default HomePage;