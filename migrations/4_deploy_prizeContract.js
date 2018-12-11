var SecurePassphraseCheck = artifacts.require("./SecurePassphraseCheck.sol");
var BasicToken = artifacts.require("./BasicToken.sol");
var ERC20Prize = artifacts.require("./ERC20Prize.sol");

module.exports = function(deployer) {
    var question = 'whatismyname?'
    var answer = 'mynameistata';
    var answerPrivateKey = web3.utils.keccak256(answer);
    var answerAddress = web3.eth.accounts.privateKeyToAccount(answerPrivateKey).address;
    deployer.deploy(ERC20Prize, SecurePassphraseCheck.address, BasicToken.address, web3.utils.fromAscii(question), answerAddress);
};
