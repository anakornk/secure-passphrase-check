import React from 'react';

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
            questions.push(
                <p key={i}><a href={"/?page=question&qid=" + qids[i]}>{qids[i]} {this.props.web3.utils.toAscii(questionsText[i])}</a></p>
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