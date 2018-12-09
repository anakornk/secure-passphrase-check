var SecurePassphraseCheck = artifacts.require("./SecurePassphraseCheck.sol");
var BasicToken = artifacts.require("./BasicToken.sol");

module.exports = function(deployer) {
  deployer.deploy(BasicToken);
  deployer.deploy(SecurePassphraseCheck);
};
