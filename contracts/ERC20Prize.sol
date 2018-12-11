pragma solidity >= 0.4.0;
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "./SecurePassphraseCheck.sol";

contract ERC20Prize {
    using SafeERC20 for IERC20;

    SecurePassphraseCheck public spcContract;
    IERC20 public erc20TokenContract;
    uint public qId;

    event Claim(address winner, uint prizeValue);

    constructor(address _spcContractAddress, address _erc20TokenContractAddress, bytes32 _questionText, address _answerAddress) public {
        spcContract = SecurePassphraseCheck(_spcContractAddress);
        erc20TokenContract = IERC20(_erc20TokenContractAddress);
        qId = spcContract.newQuestion(_questionText, _answerAddress, 1);
    }

    function claim() public {
        require(spcContract.isWinner(qId, msg.sender), "You are not the winner");
        // safe transfer prize
        uint prizeValue = getPrize();
        erc20TokenContract.safeTransfer(msg.sender, prizeValue);
        emit Claim(msg.sender, prizeValue);
    }

    function getPrize() public view returns (uint) {
        return erc20TokenContract.balanceOf(this);
    }

    function getSPCContractAddress() public view returns (address spcContractAddress) {
        return address(spcContract);
    }
}