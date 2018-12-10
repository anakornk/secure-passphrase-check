pragma solidity >= 0.4.0;

interface SPCCallback {
    function __callback(uint _code, uint qId, uint _address) external;
}