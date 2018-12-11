var SecurePassphraseCheck = artifacts.require("./SecurePassphraseCheck.sol");
const BN = require('bn.js');


contract('Test SecurePassphraseCheck', function(accounts) {
  var testAccount = accounts[0];
  var question = 'whatismyname?'
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
    
    await instance.newQuestion(web3.utils.fromAscii(question), answerAddress, 1, {from: testAccount})
    let qId = (await instance.numQuestions()) - 1; // get last question_id
    let res = await instance.getQuestion(qId);
    assert.equal(web3.utils.toAscii(res.questionText).replace(/\0/g, ''), question);
    assert.strictEqual(res.answerAddress, answerAddress);

    let qids = await instance.getQids.call(testAccount, {from: testAccount});
    assert.equal(qids.length, 1);
  });

  it("should check passphrase correctly", async function() {
    let instance = await SecurePassphraseCheck.deployed();
    let qId = (await instance.numQuestions()) - 1;
    let check1 = await instance.checkAnswer.call(qId, signature, {from: testAccount})
    assert.strictEqual(check1, true);
    let check2 = await instance.checkAnswer.call(qId, '0x6dedb72af469c493eeb274d19c0ff9a4d9ffc26e783276d5b6d297badebec83a70d920d26bb3702d8c2d9e74dbc1a36e65ed234831b0c29cec7f4f480eb224d71c', {from: testAccount})
    assert.strictEqual(check2, false);
  });

  it("should update winner correctly", async function() {
    let instance = await SecurePassphraseCheck.deployed();
    let qId = (await instance.numQuestions()) - 1;
    await instance.submit(qId, signature, {from: testAccount});
    let check = await instance.isWinner.call(qId, testAccount, {from: testAccount});
    assert.strictEqual(check, true);
  });

  it("should revert if there is already a winner", async function() {
    let instance = await SecurePassphraseCheck.deployed();
    let qId = (await instance.numQuestions()) - 1;
    try {
        await instance.submit(qId, signature, {from: testAccount});
        assert.fail();
    } catch (err) {
      assert.ok(/revert/.test(err.message));
    }

  });
});