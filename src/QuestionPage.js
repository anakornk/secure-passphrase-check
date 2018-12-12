import React from 'react';

class QuestionPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            textValue: ''
        }
        console.log(props);
        this.props.spcContract.methods.getQuestion(this.props.qid).call().then((res) => {
            this.setState({
                loading: false,
                question: res
            });
            console.log(res);
        }).catch((error) => console.log(error));

        // bind this
        this.handleChange = this.handleChange.bind(this);
        this.submit = this.submit.bind(this);
    }

    submit(){
        console.log("submit" + this.state.textValue);
    }

    handleChange(event) {
        this.setState({textValue: event.target.value});
    }
    

    render() {
        if(this.state.loading){
            return <p>Loading..</p>
        }

        return (
            <div>
                <p>{this.props.web3.utils.toAscii(this.state.question.questionText)}</p>
                <p>{this.state.question.answerAddress}</p>
                <p>{this.state.question.numWinners} / {this.state.question.maxWinners}</p>
                <input type="text" value={this.state.textValue} onChange={this.handleChange} />
                <button onClick={this.submit} >Submit</button>
            </div>
        );
    }
}

export default QuestionPage;