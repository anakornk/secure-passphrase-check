var SecurePassphraseCheck = artifacts.require("./SecurePassphraseCheck.sol");
var BasicToken = artifacts.require("./BasicToken.sol");
var PrizeCreator = artifacts.require("./PrizeCreator.sol");
var Prize = artifacts.require("./Prize.sol");
const BN = require('bn.js');


contract('Test PrizeCreator', function(accounts) {
  var testAccount = accounts[0];
  var question = 'whatismyname?'
  var answer = 'mynameistata';
  var answerPrivateKey = web3.utils.keccak256(answer);
  var answerAddress = web3.eth.accounts.privateKeyToAccount(answerPrivateKey).address;
  var a = new BN(testAccount.substr(2), 16);
  var { signature } = web3.eth.accounts.sign(a.toBuffer(), answerPrivateKey);

  it("should add ETHPrize correctly", async function() {
    let scpContract = await SecurePassphraseCheck.deployed();
    let prizeCreator = await PrizeCreator.deployed();
    await scpContract.newQuestion(web3.utils.fromAscii(question), answerAddress, 1, {from: testAccount})
    let qId = (await scpContract.numQuestions()) - 1; // get last question_id
    await prizeCreator.createETHPrize(qId);
    let prizeAddress = await prizeCreator.getPrizeAddress(qId);
    assert.notEqual(prizeAddress, '0x0000000000000000000000000000000000000000');
  });

  it("should check ETHPrize value correctly", async function() {
    let scpContract = await SecurePassphraseCheck.deployed();
    let basicToken = await BasicToken.deployed();
    let prizeCreator = await PrizeCreator.deployed();
    let qId = (await scpContract.numQuestions()) - 1; // get last question_id
    let prizeAddress = await prizeCreator.getPrizeAddress(qId);
    let prize = await Prize.at(prizeAddress);
    await basicToken.mint(prizeAddress, 100, {from: testAccount});
    let prizeValue = await prize.getPrizeValue.call({from: testAccount});
    assert(prizeValue, 100);
  });

  // it("should not be able to claim prize if not winner", async function() {
  //   let instance = await ERC20Prize.deployed();
  //   try {
  //       await instance.claim({from: testAccount});
  //       assert.fail();
  //   } catch (err) {
  //       assert.ok(/revert/.test(err.message));
  //   }    
  // });

  // it("should be able to claim prize if is the winner", async function() {
  //   let instance = await ERC20Prize.deployed();
  //   let scpContract = await SecurePassphraseCheck.deployed();
  //   let qId = await instance.qId.call({from: testAccount});
    
  //   await scpContract.submit(qId, signature);
  //   await instance.claim({from: testAccount});
  //   let prizeValue = await instance.getPrize.call({from: testAccount});
  //   assert(prizeValue, 0);
  // });

});