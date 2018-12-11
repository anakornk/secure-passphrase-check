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

  it("should add a new question correctly", async function() {
    let scpContract = await SecurePassphraseCheck.deployed();
    let instance = await ERC20Prize.deployed();

    let qId = (await scpContract.numQuestions()) - 1; // get last question_id
    let qids = await scpContract.getQids.call(instance.address);
    assert.equal(qids.length, 1);
    assert.equal(qids[0], qId);
  });

  it("should check prize value correctly", async function() {
    let basicToken = await BasicToken.deployed();
    let instance = await ERC20Prize.deployed();

    await basicToken.mint(instance.address, 100, {from: testAccount});
    let prizeValue = await instance.getPrize.call({from: testAccount});
    assert(prizeValue, 100);
  });

  it("should not be able to claim prize if not winner", async function() {
    let instance = await ERC20Prize.deployed();
    try {
        await instance.claim({from: testAccount});
        assert.fail();
    } catch (err) {
        assert.ok(/revert/.test(err.message));
    }    
  });

  it("should be able to claim prize if is the winner", async function() {
    let instance = await ERC20Prize.deployed();
    let scpContract = await SecurePassphraseCheck.deployed();
    let qId = await instance.qId.call({from: testAccount});
    
    await scpContract.submit(qId, signature);
    await instance.claim({from: testAccount});
    let prizeValue = await instance.getPrize.call({from: testAccount});
    assert(prizeValue, 0);
  });

});