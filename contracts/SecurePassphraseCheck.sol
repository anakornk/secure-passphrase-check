pragma solidity >= 0.4.0;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

contract SecurePassphraseCheck {
    struct Question {
        bytes32 questionText;
        address answerAddress;
        address winner;
        IERC20 erc20TokenContract;
    }

    uint public numQuestions;
    mapping ( uint => Question ) questions;
    mapping( address => uint[] ) addressToQids;
    event Log(uint8 code, address user);

    function newQuestion(bytes32 _questionText, address _answerAddress, address _erc20TokenContractAddress) public returns (uint qId){
        qId = numQuestions++;
        questions[qId] = Question(_questionText, _answerAddress, address(0x0), IERC20(_erc20TokenContractAddress));
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
        emit Log(0, msg.sender);
    }

    modifier noWinner(uint _qId) {
        require(questions[_qId].winner == address(0x0), "There is already a winner");
        _;
    }

    function isWinner(uint _qId) public view returns (bool) {
        return questions[_qId].winner == msg.sender;
    }

    function claim(uint _qId) public {
        require(isWinner(_qId), "You are not the winner");
        // transfer prize
        questions[_qId].erc20TokenContract.transfer(msg.sender, getPrize(_qId));
        emit Log(1, msg.sender);

    }

    function getPrize(uint _qId) public view returns (uint) {
        return questions[_qId].erc20TokenContract.balanceOf(this);
    }
}