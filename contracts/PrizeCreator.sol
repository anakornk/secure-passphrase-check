pragma solidity >= 0.4.0;
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
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

contract ETHPrize is Prize {

    constructor(address _spcContractAddress, uint _qId) public Prize(_spcContractAddress, _qId) {
    }
    
    function getPrizeValue() public view returns (uint) {
        return address(this).balance;
    }

    function getPrizeSymbol() public view returns (string) {
        return "ETH";
    }

    function () public payable {}   

    function _claim() internal {
        uint prizeValue = getPrizeValue();
        msg.sender.transfer(prizeValue);
        emit Claim(msg.sender, prizeValue);
    }
}


contract ERC20Prize is Prize {
    using SafeERC20 for IERC20;

    IERC20 public erc20TokenContract;
    string public symbol;

    constructor(address _spcContractAddress, uint _qId, address _erc20TokenContractAddress, string _symbol) 
    public Prize(_spcContractAddress, _qId) {
        erc20TokenContract = IERC20(_erc20TokenContractAddress);
        symbol = _symbol;
    }

    function getPrizeValue() public view returns (uint) {
        return erc20TokenContract.balanceOf(this);
    }

    function getPrizeSymbol() public view returns (string) {
        return symbol;
    }

    function _claim() internal {
        // safe transfer prize
        uint prizeValue = getPrizeValue();
        erc20TokenContract.safeTransfer(msg.sender, prizeValue);
        emit Claim(msg.sender, prizeValue);
    }

}

contract PrizeCreator {
    address public spcContractAddress;
    mapping ( uint => address ) public qIdToPrize;

    constructor(address _spcContractAddress) public {
        spcContractAddress = _spcContractAddress;
    }

    function createERC20Prize(uint _qId, address _erc20TokenContractAddress, string _symbol) public {
        address prizeAddress = new ERC20Prize(spcContractAddress, _qId, _erc20TokenContractAddress, _symbol);
        qIdToPrize[_qId] = prizeAddress;
    }

    function createETHPrize(uint _qId) public {
        address prizeAddress = new ETHPrize(spcContractAddress, _qId);
        qIdToPrize[_qId] = prizeAddress;
    }
}