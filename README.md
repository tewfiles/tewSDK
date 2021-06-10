# TEWFILES opt-in onboarding

**Upgraded from OZ tutorial to use latest OpenZeppelin SDK by @TewChaynz**

This is a sample project illustrating how a regular TEWFILES token can be migrated to an upgradeable TEWFILES using the OpenZeppelin SDK. Please follow our [official documentation](https://docs.zeppelinos.org/docs/erc20.html) to better understand how to onboard your token to the OpenZeppelin SDK.

```bash
npm run-script build
npm test
```

# Deployment

Read https://docs.openzeppelin.com/learn/preparing-for-mainnet

You'll need:
* Legacy TEWFILES contract address
* Admin address
* Deployer seed and address

Use `oz accounts` to list accounts, where the seed is fetched from `secrets.json`, and use `oz balance` to check deployer account balance. Copy the `secrets.json.example` file to `secrets.json` and fill in the mnemonic using `npx mnemonics` to generate, or any other valid method.

```bash
oz add IXOToken
oz add TEWFILESMigrator
oz push
oz create TEWFILESMigrator
oz create IXOToken
# Call TEWFILESMigrator.beginMigration()
oz send-tx
# Set deployer as whitelist user (NB: this is necessary in addition to being an admin)
oz send-tx
# Confirm token cap, other details, for example
oz call
```

# Basic migration steps

1. On legacy token contract, each user that wants to migrate has to first approve the transfer of X tokens to migrator contract
2. On migrator contract, call the migrate function
3. The legacy token will be burnt, and the new token will be minted

# Post-deployment steps

1. IXOToken.transferOwnership(newOwner)
2. Migrator.addWhitelistAdmin(newOwner)
3. Migrator.addWhitelisted(newOwner)
4. Migrator.renounceWhitelistAdmin(deployer)
5. Migrator.renounceWhitelisted(deployer)
6. Finally, set new OpenZeppelin admin with `npx oz set-admin`

# Verified code

After running `npx oz verify _`:
* TEWFILESMigrator: https://etherscan.io/address/0x9B6028ea9CC135C121bd8EAb7510ec7E19347E4E#code
* IXOToken https://etherscan.io/address/0x58c3Be0F213A495B879B7558A56D734A90b3B2d4#code

# Notes

* Migrations, in `_migrations`, are not working and are just there for referrence. The OZ CLI was used for all transactions and deployment.
* There is both a `networks.js` and `truffle-config.js` config file. There were odd issues that required this, WIP.
