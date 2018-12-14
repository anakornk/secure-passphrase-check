var SecurePassphraseCheck = artifacts.require("./SecurePassphraseCheck.sol");
var BasicToken = artifacts.require("./BasicToken.sol");
var PrizeCreator = artifacts.require("./PrizeCreator.sol");
var Prize = artifacts.require("./Prize.sol");
const BN = require('bn.js');


contract('Test ERC20Prize', function(accounts) {
  var testAccount = accounts[0];
  var question = 'whatismyname?'
  var answer = 'mynameistata';
  var answerPrivateKey = web3.utils.keccak256(answer);
  var answerAddress = web3.eth.accounts.privateKeyToAccount(answerPrivateKey).address;
  var a = new BN(testAccount.substr(2), 16);
  var { signature } = web3.eth.accounts.sign(a.toBuffer(), answerPrivateKey);

  it("should not be able to add ERC20Prize if not owner", async function() {
    let prizeCreator = await PrizeCreator.deployed();
    let basicToken = await BasicToken.deployed();

    try {
      await prizeCreator.createERC20Prize(0, basicToken.address, "TATA");
      assest.fail();
    } catch (err) {
      assert.ok(/revert/.test(err.message));
    }

  });

  it("should add ERC20Prize correctly", async function() {
    let scpContract = await SecurePassphraseCheck.deployed();
    let prizeCreator = await PrizeCreator.deployed();
    let basicToken = await BasicToken.deployed();
    await scpContract.newQuestion(web3.utils.fromAscii(question), answerAddress, 1, {from: testAccount})
    let qId = (await scpContract.numQuestions()) - 1; // get last question_id
    await prizeCreator.createERC20Prize(qId, basicToken.address, "TATA");
    let prizeAddress = await prizeCreator.getPrizeAddress(qId);
    assert.notEqual(prizeAddress, '0x0000000000000000000000000000000000000000');
  });

  it("should check ERC20Prize value correctly", async function() {
    let scpContract = await SecurePassphraseCheck.deployed();
    let basicToken = await BasicToken.deployed();
    let prizeCreator = await PrizeCreator.deployed();
    let qId = (await scpContract.numQuestions()) - 1; // get last question_id
    let prizeAddress = await prizeCreator.getPrizeAddress(qId);
    let prize = await Prize.at(prizeAddress);
    await basicToken.mint(prizeAddress, 100, {from: testAccount});
    let prizeValue = await prize.getPrizeValue.call({from: testAccount});
    assert(prizeValue, 130);
  });

  it("should not be able to claim ethprize if not winner", async function() {
    let scpContract = await SecurePassphraseCheck.deployed();
    let prizeCreator = await PrizeCreator.deployed();
    let qId = (await scpContract.numQuestions()) - 1; // get last question_id
    let prizeAddress = await prizeCreator.getPrizeAddress(qId);
    let prize = await Prize.at(prizeAddress);
    try {
        await prize.claim({from: testAccount});
        assert.fail();
    } catch (err) {
        assert.ok(/revert/.test(err.message));
    }    
  });

  it("should be able to claim prize if is the winner", async function() {
    let scpContract = await SecurePassphraseCheck.deployed();
    let prizeCreator = await PrizeCreator.deployed();
    let qId = (await scpContract.numQuestions()) - 1; // get last question_id
    let prizeAddress = await prizeCreator.getPrizeAddress(qId);
    let prize = await Prize.at(prizeAddress);
    
    await scpContract.submit(qId, signature);
    await prize.claim({from: testAccount});
    let prizeValue = await prize.getPrize.call({from: testAccount});
    assert(prizeValue, 0);
  });


  // it("should check ETHPrize value correctly", async function() {
  //   let scpContract = await SecurePassphraseCheck.deployed();
  //   let basicToken = await BasicToken.deployed();
  //   let prizeCreator = await PrizeCreator.deployed();
  //   let qId = (await scpContract.numQuestions()) - 1; // get last question_id
  //   let prizeAddress = await prizeCreator.getPrizeAddress(qId);
  //   let prize = await Prize.at(prizeAddress);
  //   await basicToken.mint(prizeAddress, 100, {from: testAccount});
  //   let prizeValue = await prize.getPrizeValue.call({from: testAccount});
  //   assert(prizeValue, 100);
  // });

});