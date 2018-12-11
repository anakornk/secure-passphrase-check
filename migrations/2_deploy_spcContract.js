var SecurePassphraseCheck = artifacts.require("./SecurePassphraseCheck.sol");

module.exports = function(deployer) {
  deployer.deploy(SecurePassphraseCheck);
};
