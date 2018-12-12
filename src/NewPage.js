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
        // submit
        console.log(this.state);
        event.preventDefault();
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