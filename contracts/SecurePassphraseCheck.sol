pragma solidity >= 0.4.0;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";

contract SecurePassphraseCheck {
    struct Question {
        bytes32 questionText;
        address answerAddress;
        address winner;
    }

    uint public numQuestions;
    mapping ( uint => Question ) questions;
    mapping( address => uint[] ) addressToQids;
    event Log(uint qId, address user);

    function getQids(address _address) public view returns (uint[] qids) {
        return addressToQids[_address];
    }

    function newQuestion(bytes32 _questionText, address _answerAddress) public returns (uint qId) {
        qId = numQuestions++;
        questions[qId] = Question(_questionText, _answerAddress, address(0x0));
        addressToQids[msg.sender].push(qId);
    }

    function getQuestion(uint _qId) public view returns (bytes32 questionText, address answerAddress, address winner) {
        Question storage question = questions[_qId];
        return (question.questionText, question.answerAddress, question.winner);
    }

    function checkAnswer(uint _qId, bytes _signature) public view returns (bool) {
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n20", msg.sender));
        bool condition = ECDSA.recover(prefixedHash, _signature) == questions[_qId].answerAddress;
        return condition;
    }

    function submit(uint _qId, bytes _signature) public noWinner(_qId) {
        require(checkAnswer(_qId, _signature), "Incorrect Secret");
        questions[_qId].winner = msg.sender;
        emit Log(_qId, msg.sender);
    }

    modifier noWinner(uint _qId) {
        require(questions[_qId].winner == address(0x0), "There is already a winner");
        _;
    }

    function isWinner(uint _qId, address _address) public view returns (bool) {
        return questions[_qId].winner == _address;
    }
}