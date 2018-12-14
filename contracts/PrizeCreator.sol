pragma solidity >= 0.4.0;
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "./SecurePassphraseCheck.sol";
import "./Prize.sol";

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
    SecurePassphraseCheck public spcContract;
    mapping ( uint => address ) public qIdToPrizeAddress;

    constructor(address _spcContractAddress) public {
        spcContract = SecurePassphraseCheck(_spcContractAddress);
    }

    function getPrizeAddress(uint _qId) public view returns (address prizeAddress) {
        return qIdToPrizeAddress[_qId];
    }

    modifier hasNoPrize(uint _qId) {
        require(getPrizeAddress(_qId) == address(0x0), "Prize exists already");
        _;
    }

    modifier isOwner(uint _qId) {
        require(spcContract.getCreator(_qId) == msg.sender, "Not owner");
        _;
    }

    function createERC20Prize(uint _qId, address _erc20TokenContractAddress, string _symbol) public hasNoPrize(_qId) isOwner(_qId) {
        address prizeAddress = new ERC20Prize(address(spcContract), _qId, _erc20TokenContractAddress, _symbol);
        qIdToPrizeAddress[_qId] = prizeAddress;
    }

    function createETHPrize(uint _qId) public hasNoPrize(_qId) isOwner(_qId) {
        address prizeAddress = new ETHPrize( address(spcContract), _qId);
        qIdToPrizeAddress[_qId] = prizeAddress;
    }
}