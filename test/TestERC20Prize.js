var SecurePassphraseCheck = artifacts.require("./SecurePassphraseCheck.sol");
var BasicToken = artifacts.require("./BasicToken.sol");
var ERC20Prize = artifacts.require("./ERC20Prize.sol");
const BN = require('bn.js');


contract('ERC20Prize', function(accounts) {
  var testAccount = accounts[0];
  var answer = 'mynameistata';
  var answerPrivateKey = web3.utils.keccak256(answer);
  var a = new BN(testAccount.substr(2), 16);
  var { signature } = web3.eth.accounts.sign(a.toBuffer(), answerPrivateKey);

  it("should add new question correctly", async function() {
    let scpContract = await SecurePassphraseCheck.deployed();
    let erc20TokenContract = await BasicToken.deployed();
    let instance = await ERC20Prize.deployed();

    let qId = (await instance.numQuestions()) - 1; // get last question_id
    let qids = await instance.getQids.call(instance.address);
    assert.equal(qids.length, 1);
    assert.equal(qids[0], qId);
  });

});