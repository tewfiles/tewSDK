const shouldBehaveLikeERC20Detailed = require('./behaviors/ERC20Detailed.behavior')
const shouldBehaveLikeERC20 = require('./behaviors/ERC20.behavior')

const LegacyToken = artifacts.require('LegacyToken')

contract('LegacyToken', function ([_, owner, recipient, anotherAccount]) {
  const initialSupply = web3.utils.toBN('1000000000000')

  beforeEach('deploying token', async function () {
    this.token = await LegacyToken.new({ from: owner })
  })

  shouldBehaveLikeERC20([owner, recipient, anotherAccount], initialSupply)
  shouldBehaveLikeERC20Detailed('IXO Token', 'IXO', web3.utils.toBN('8'), initialSupply)
})
