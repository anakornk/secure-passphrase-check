var SecurePassphraseCheck = artifacts.require("./SecurePassphraseCheck.sol");
const BN = require('bn.js');


contract('SecurePassphraseCheck', function(accounts) {
  var testAccount = accounts[0];
  var answer = 'mynameistata';
  var answerPrivateKey = web3.utils.keccak256(answer);
  var answerAddress = web3.eth.accounts.privateKeyToAccount(answerPrivateKey).address;
  var a = new BN(testAccount.substr(2), 16);
  var { signature } = web3.eth.accounts.sign(a.toBuffer(), answerPrivateKey);

  console.log("Address: " + testAccount);
  console.log('Answer: ' + answer);
  console.log("Answer Private Key: " + answerPrivateKey);
  console.log("Answer Address: " + answerAddress);
  console.log("Signature: " + signature);

  it("should add question correctly", async function() {
    let instance = await SecurePassphraseCheck.deployed();
    await instance.addQuestion(answerAddress, accounts[0], {from: testAccount})
    let res = await instance.answerAddress.call();
    assert.strictEqual(res, answerAddress);
  });
  it("should check passphrase correctly", async function() {
    let instance = await SecurePassphraseCheck.deployed();
    let check1 = await instance.checkAnswer.call(signature, {from: testAccount})
    assert.strictEqual(check1, true);
    let check2 = await instance.checkAnswer.call('0x6dedb72af469c493eeb274d19c0ff9a4d9ffc26e783276d5b6d297badebec83a70d920d26bb3702d8c2d9e74dbc1a36e65ed234831b0c29cec7f4f480eb224d71c', {from: testAccount})
    assert.strictEqual(check2, false);
  });
});