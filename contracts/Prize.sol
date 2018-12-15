pragma solidity >= 0.4.0;
import "./SecurePassphraseCheck.sol";

contract Prize {
    SecurePassphraseCheck public spcContract;
    uint public qId;

    event Claim(address winner, uint prizeValue);

    constructor(address _spcContractAddress, uint _qId) public {
        spcContract = SecurePassphraseCheck(_spcContractAddress);
        qId = _qId;
    }

    function getSPCContractAddress() public view returns (address spcContractAddress) {
        return address(spcContract);
    }

    function getPrize() public view returns (uint value, string symbol) {
        return (getPrizeValue(), getPrizeSymbol());
    }

    modifier isWinner() {
        require(spcContract.isWinner(qId, msg.sender), "You are not the winner");
        _;
    }


    function claim() public isWinner {
        _claim();
    }
    function getPrizeValue() public view returns (uint);

    function getPrizeSymbol() public view returns (string);

    function _claim() internal;

}
