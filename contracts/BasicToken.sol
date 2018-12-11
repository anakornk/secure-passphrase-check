pragma solidity >= 0.4.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Capped.sol";

contract BasicToken is ERC20Capped {
    constructor(uint _cap) public ERC20Capped(_cap) {
    }
}