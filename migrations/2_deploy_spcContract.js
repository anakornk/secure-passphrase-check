var SecurePassphraseCheck = artifacts.require("./SecurePassphraseCheck.sol");
var BasicToken = artifacts.require("./BasicToken.sol");
var ERC20Prize = artifacts.require("./ERC20Prize.sol");

module.exports = function(deployer) {
  deployer.deploy(SecurePassphraseCheck);
  deployer.deploy(BasicToken);
};
