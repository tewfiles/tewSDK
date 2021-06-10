with import <nixpkgs> { };

stdenv.mkDerivation {
  name = "ixo-oz-erc20-env";
  buildInputs = [
    python38
    python38Packages.pip
    python38Packages.virtualenvwrapper
    nodejs-13_x
    git
  ];
  shellHook = ''
    #ERC20_MIGRATOR_ADDRESS=
    #LEGACY_TOKEN_ADDRESS=
    truffle-console() {
      npx truffle console --network local
      #truffle(local)> compile
      #truffle(local)> owner = (await web3.eth.getAccounts())[0]
      #truffle(local)> legacyToken = await MyLegacyToken.new({ from: owner })
      #truffle(local)> legacyToken.address
      #truffle(local)> (await legacyToken.balanceOf(owner)).toString()
    }
    generate_mnemonic() {
      # See https://docs.openzeppelin.com/learn/connecting-to-public-test-networks#connecting-project-to-network
      npx mnemonics
    }
    oz-init_1() {
      npx oz init token-migration 1.0.0
    }
    oz-configure_2() {
      npx oz link @openzeppelin/contracts-ethereum-package
      npx oz add IXOToken
      npx oz add ERC20Migrator
    }
    oz-deploy_3() {
      echo 'Option --deploy-dependencies only necessary for dev'
      npx oz push -n local --deploy-dependencies
    }
    oz-deploy-migrator_4() {
      set -u
      npx oz add ERC20Migrator
      npx oz push -n local --deploy-dependencies
      npx oz deploy -n local ERC20Migrator $LEGACY_TOKEN_ADDRESS
      set +u
    }
    oz-deploy-token_5() {
      ADDRESS=$(npx oz deploy -n local -k upgradeable MyUpgradeableToken)
      #$LEGACY_TOKEN_ADDRESS,$ERC20_MIGRATOR_ADDRESS
      npx oz call -n local --to $ADDRESS
dbD9F43cCd776D7664C --method initialize --args $LEGACY_TOKEN_ADDRESS,$ERC20_MIGRATOR_ADDRESS
    }
  '';
}
