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
        var answer = this.state.textValue;
        var web3 = this.props.web3;
        var answerPrivateKey = web3.utils.keccak256(answer);
        var a = new web3.utils.BN(this.props.account.substr(2), 16);
        var { signature } = web3.eth.accounts.sign(a.toBuffer(), answerPrivateKey);
        this.props.spcContract.methods.checkAnswer(this.props.qid, signature).call({from: this.props.account})
        .then((res) => {
            console.log(res);

            if(res) {
                this.props.spcContract.methods.submit(this.props.qid, signature)
                .send({from: this.props.account})
                .on('transactionHash', function(hash){
                    console.log(hash)
                })
                .on('receipt', function(receipt){
                    console.log(receipt);
                })
                .on('confirmation', function(confirmationNumber, receipt){
                    console.log(confirmationNumber, receipt);
                })
                .on('error', console.error);
            }
        });
        
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
                <p>{this.state.question.winners}</p>
                <input type="text" value={this.state.textValue} onChange={this.handleChange} />
                <button onClick={this.submit} >Submit</button>
            </div>
        );
    }
}

export default QuestionPage;