pragma solidity >= 0.4.0;
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "./SecurePassphraseCheck.sol";

contract ERC20Prize {
    IERC20 public erc20TokenContract;
    SecurePassphraseCheck public spcContract;
    uint public qId;

    event Claim(address winner, uint prizeValue);

    constructor(address _spcContractAddress, address _erc20TokenContractAddress, uint _qId) public {
        spcContract = SecurePassphraseCheck(_spcContractAddress);
        erc20TokenContract = IERC20(_erc20TokenContractAddress);
        qId = _qId;
    }

    function claim() public {
        require(spcContract.isWinner(qId, msg.sender), "You are not the winner");
        // transfer prize
        uint prizeValue = getPrize();
        erc20TokenContract.transfer(msg.sender, prizeValue);
        emit Claim(msg.sender, prizeValue);
    }

    function getPrize() public view returns (uint) {
        return erc20TokenContract.balanceOf(this);
    }
}