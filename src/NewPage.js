import React from 'react';

class NewPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            question: '',
            answer: '',
            max: 1
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

        spcContract.methods.newQuestion(web3.utils.fromAscii(question), answerAddress, 1)
        .send({from: account})
        .on('transactionHash', function(hash){
            console.log('hash', hash)
        })
        .on('receipt', function(receipt){
            console.log('receipt', receipt);
        })
        .on('confirmation', function(confirmationNumber, receipt){
            console.log('confirmation', confirmationNumber, receipt);
        })
        .on('error', console.error);

    }

    render() {
    return (
        <form onSubmit={this.handleSubmit}>
        <label>
            Question:
            <input type="text" name="question" value={this.state.question} onChange={this.handleChange} />
        </label>
        <label>
            Answer:
            <input type="text" name="answer" value={this.state.answer} onChange={this.handleChange} />
        </label>
        <label>
            Max:
            <input type="number" name="max" value={this.state.max} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
        </form>
    );
    }
}

export default NewPage;