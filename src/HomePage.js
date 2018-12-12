import React from 'react';

class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.props.spcContract.methods.numQuestions().call().then((res) => {
            this.setState({
                loading: false,
                numQuestions: res
            });
        }).catch((error) => console.log(error));

        this.state = {
            loading: true,
            numQuestions: 0
        };
    }

    render() {
        if(this.state.loading) {
            return (
                <div>Loading..</div>
            )
        }

        let questions = [];
        for(let i=0; i < this.state.numQuestions; i++) {
            questions.push(
                <p key={i}><a href={"/?page=question&qid=" + i}>{i}</a></p>
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