// Load zos scripts and truffle wrapper function
const { scripts, ConfigManager } = require('@openzeppelin/cli');
const { add, push, create } = scripts;
const LegacyToken = artifacts.require("LegacyToken");

async function deploy(options, accounts, legacyTokenAddress) {
  add({ contractsData: [{ name: 'IXOToken', alias: 'IXOToken' }] })
  add({ contractsData: [{ name: 'ERC20Migrator', alias: 'ERC20Migrator' }] })

  await push(options)

  const migrator = await create(Object.assign({ contractAlias: 'ERC20Migrator', methodName: 'initialize', methodArgs: [legacyTokenAddress, accounts[1]] }, options))
  await create(Object.assign({ contractAlias: 'IXOToken', methodName: 'initialize', methodArgs: [legacyTokenAddress, migrator.address] }, options))
}

module.exports = function(deployer, networkName, accounts) {
  deployer.then(async () => {
    const { network, txParams } = await ConfigManager.initNetworkConfiguration({ network: networkName, from: accounts[1] })
    const options = { network, txParams }

    // add({ contractsData: [{ name: 'LegacyToken', alias: 'LegacyToken' }] })
    // await push(options)
    const legacyToken = await deployer.deploy(LegacyToken)
    // const legacyToken = await create(Object.assign({ contractAlias: 'LegacyToken' }, options))
    // const legacyTokenAddress = "0x58c3Be0F213A495B879B7558A56D734A90b3B2d4" // Rinkeby deployment, account 0 0xd651A06279804bCc0cEdff042405090DCFDAE01c

    console.log(network);

    await deploy(options, accounts, legacyToken.address)
  })
}