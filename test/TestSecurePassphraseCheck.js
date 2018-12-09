var SecurePassphraseCheck = artifacts.require("./SecurePassphraseCheck.sol");

contract('SecurePassphraseCheck', function(accounts) {
  it("should add question correctly", async function() {
    let instance = await SecurePassphraseCheck.deployed();
    await instance.addQuestion('0xcCde9d432eF8379c7946D85117B4C6Ef7C2dF565', accounts[0], {from: accounts[0]})
    let answerAddress = await instance.answerAddress.call();
    assert.strictEqual(answerAddress, '0xcCde9d432eF8379c7946D85117B4C6Ef7C2dF565');
  });
  it("should check answer correct", async function() {
    let instance = await SecurePassphraseCheck.deployed();
    let check = await instance.checkAnswer.call('0x5dedb72af469c493eeb274d19c0ff9a4d9ffc26e783276d5b6d297badebec83a70d920d26bb3702d8c2d9e74dbc1a36e65ed234831b0c29cec7f4f480eb224d71c', {from: accounts[0]})
    assert.strictEqual(check, true);
  });
});