pragma solidity >= 0.4.0;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

contract SecureSecretCheck {
    
    address public winner;
    address public answerAddress;
    IERC20 public erc20TokenContract;

    event Log(uint8 code);

    constructor() public {
    }

    function addQuestion(address _answerAddress, address _erc20TokenContractAddress) public {
        answerAddress = _answerAddress;
        erc20TokenContract = IERC20(_erc20TokenContractAddress);
    }

    function checkAnswer(bytes _signature) public view returns (bool) {
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n20", msg.sender));
        bool condition = ECDSA.recover(prefixedHash, _signature) == answerAddress;
        return condition;
    }

    function submit(bytes _signature) public noWinner {
        require(checkAnswer(_signature), "Incorrect Secret");
        winner = msg.sender;
        emit Log(0);
    }

    modifier noWinner {
        require(winner == address(0x0), "There is already a winner");
        _;
    }

    function isWinner() public view returns (bool) {
        return winner == msg.sender;
    }

    function claim() public {
        require(isWinner(), "You are not the winner");
        // transfer prize
        erc20TokenContract.transfer(msg.sender, getPrize());
        emit Log(1);

    }

    function getPrize() public view returns (uint) {
        return erc20TokenContract.balanceOf(this);
    }
}