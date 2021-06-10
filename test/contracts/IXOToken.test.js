const { expectRevert } = require('@openzeppelin/test-helpers')
const { encodeCall } = require('@openzeppelin/upgrades')
const shouldBehaveLikeERC20 = require('./behaviors/ERC20.behavior')
const shouldBehaveLikeERC20Detailed = require('./behaviors/ERC20Detailed.behavior')

const LegacyToken = artifacts.require('LegacyToken')
const IXOToken = artifacts.require('IXOToken')
const ERC20Migrator = artifacts.require('ERC20Migrator')

contract('IXOToken', function ([_, owner, recipient, anotherAccount]) {
  const name = 'IXO Token'
  const symbol = 'IXO'
  const decimals = 8
  const cap = web3.utils.toBN('1000000000000000000')
  const initialSupply = web3.utils.toBN('1000000000000')

  beforeEach('deploying legacy and upgradeable tokens', async function () {
    this.legacyToken = await LegacyToken.new({ from: owner })
    
    this.migrator = await ERC20Migrator.new()
    const migratorData = encodeCall('initialize', ['address', 'address'], [this.legacyToken.address, owner])
    await this.migrator.sendTransaction({ data: migratorData })
    await this.migrator.addWhitelisted(owner, { from: owner })
    
    this.upgradeableToken = await IXOToken.new()
    const upgradeableTokenData = encodeCall('initialize', ['address', 'uint256', 'address'], [this.legacyToken.address, web3.utils.toHex(cap), this.migrator.address])
    await this.upgradeableToken.sendTransaction({ data: upgradeableTokenData })

    await this.migrator.beginMigration(this.upgradeableToken.address);
  })

  describe('ERC20 token behavior', function () {
    beforeEach('migrating balance to new token', async function () {
      await this.legacyToken.approve(this.migrator.address, initialSupply, { from: owner })
      await this.migrator.migrate(owner, initialSupply, { from: owner })
      this.token = this.upgradeableToken
    })

    shouldBehaveLikeERC20([owner, recipient, anotherAccount], initialSupply)
    shouldBehaveLikeERC20Detailed(name, symbol, decimals)
  })

  describe('migrate', function () {
    beforeEach('approving 50 tokens to the new contract', async function () {
      await this.legacyToken.approve(this.migrator.address, 50, { from: owner })
    })

    describe('when the amount is lower or equal to the one approved', function () {
      const amount = web3.utils.toBN('50')

      it('mints that amount of the new token', async function () {
        await this.migrator.migrate(owner, amount, { from: owner })

        const currentBalance = await this.upgradeableToken.balanceOf(owner)
        assert(currentBalance.eq(amount))
      })

      it('transfers given amount of old tokens to the migrator', async function () {
        await this.migrator.migrate(owner, amount, { from: owner })

        const currentMigratorBalance = await this.legacyToken.balanceOf(this.migrator.address)
        assert(currentMigratorBalance.eq(amount))
      })

      it('updates the total supply', async function () {
        await this.migrator.migrate(owner, amount, { from: owner })

        const currentSupply = await this.upgradeableToken.totalSupply()
        assert(currentSupply.eq(amount))
      })
    })

    describe('when the given amount is higher than the one approved', function () {
      const amount = 51

      it('reverts', async function () {
        await expectRevert.unspecified(this.migrator.migrate(owner, amount, { from: owner }))
      })
    })
  })
})
