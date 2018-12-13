pragma solidity >= 0.4.0;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract SecurePassphraseCheck {
    using SafeMath for uint;

    struct Question {
        bytes32 questionText;
        address answerAddress;
        uint maxWinner;
        uint numWinners;
        address[] winners;
        mapping ( address => bool ) isWinner;
    }

    uint public numQuestions;
    mapping ( uint => Question ) questions;
    mapping( address => uint[] ) addressToQids;
    event Log(uint qId, address user);

    function getMyQuestions(address _address) public view returns (uint[] qids, bytes32[] questionsText) {
        qids = addressToQids[_address];
        uint len = qids.length;
        bytes32[] memory tempQuestionsText = new bytes32[](len);
        for(uint i = 0; i < len; i++) {
            tempQuestionsText[i] = questions[qids[i]].questionText;
        }
        questionsText = tempQuestionsText;
    }

    function newQuestion(bytes32 _questionText, address _answerAddress, uint _maxWinner) public returns (uint qId) {
        qId = numQuestions;
        numQuestions = numQuestions.add(1);
        // check last param, gas
        questions[qId] = Question(_questionText, _answerAddress, _maxWinner, 0, new address[](0));
        addressToQids[msg.sender].push(qId);
    }

    function getQuestion(uint _qId) public view returns (
        bytes32 questionText, 
        address answerAddress, 
        uint maxWinners, 
        uint numWinners, 
        address[] winners) {
        Question storage question = questions[_qId];
        return (question.questionText, question.answerAddress, question.maxWinner, question.numWinners, question.winners);
    }

    function checkAnswer(uint _qId, bytes _signature) public view returns (bool) {
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n20", msg.sender));
        bool condition = ECDSA.recover(prefixedHash, _signature) == questions[_qId].answerAddress;
        return condition;
    }

    function submit(uint _qId, bytes _signature) public {
        require(isWinner(_qId, msg.sender) == false, "Already is winner");
        require(notFull(_qId), "Reached maximum amount of winners");
        require(checkAnswer(_qId, _signature), "Incorrect Secret");
        Question storage question = questions[_qId];
        question.isWinner[msg.sender] = true;
        question.numWinners = question.numWinners.add(1);
        question.winners.push(msg.sender);
        // should not allow duplicate winner
        emit Log(_qId, msg.sender);
    }

    function notFull(uint _qId) public view returns (bool){
        return questions[_qId].numWinners < questions[_qId].maxWinner;
    }

    function isWinner(uint _qId, address _address) public view returns (bool) {
        return questions[_qId].isWinner[_address];
    }

    function getQuestionsFromRange(uint from, uint to) public view returns (uint[] qids, bytes32[] questionsText) {
        // memory or storage?
        require(to >= from, "to should be larger than from");
        uint len = to - from + 1;
        uint[] memory tempQids = new uint[](len);
        bytes32[] memory tempQuestionsText = new bytes32[](len);
        uint j = 0;
        for(uint i = from; i <= to; i++ ){
            tempQids[j] = i;
            tempQuestionsText[j] = questions[i].questionText;
            j++;
        }
        return (tempQids, tempQuestionsText);
    }
}