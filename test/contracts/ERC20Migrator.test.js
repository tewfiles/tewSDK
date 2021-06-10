const { assert, expectRevert } = require('@openzeppelin/test-helpers')
const { encodeCall } = require('@openzeppelin/upgrades')

const LegacyToken = artifacts.require('LegacyToken')
const IXOToken = artifacts.require('IXOToken')
const ERC20Migrator = artifacts.require('ERC20Migrator')

contract('ERC20Migrator', function ([_, owner, recipient, anotherAccount]) {
  const name = 'IXO Token'
  const symbol = 'IXO'
  const decimals = 8
  const cap = web3.utils.toBN('1000000000000000000')
  const initialSupply = web3.utils.toBN('1000000000000')
  const transferred = web3.utils.toBN('100000000')

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
      await this.legacyToken.approve(this.migrator.address, transferred, { from: owner })
      await this.legacyToken.approve(anotherAccount, transferred, { from: owner })

      await this.migrator.migrate(owner, transferred, { from: owner })
      await this.legacyToken.transfer(anotherAccount, transferred, { from: owner })

      this.token = this.upgradeableToken
    })
  })

  describe('migrate', function () {
    beforeEach('approving 50 tokens to the new contract', async function () {
      await this.legacyToken.approve(this.migrator.address, 50, { from: owner })
      await this.legacyToken.approve(this.migrator.address, 50, { from: anotherAccount })
    })

    describe('whitelisted account', function () {
      const amount = 50

      it('passes', async function () {
        await this.migrator.migrate(owner, amount, { from: owner })
      })
    })

    describe('other account', function () {
      const amount = 50

      it('reverts', async function () {
        await expectRevert.unspecified(this.migrator.migrate(anotherAccount, amount, { from: anotherAccount }))
      })
    })
  })
})
