pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "./ERC20Migrator.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20Capped.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";

contract IXOToken is Initializable, ERC20Detailed, ERC20Capped, Ownable {

  /**
   * @dev Initialization function.
   */
  function initialize(ERC20Detailed _legacyToken, uint256 _cap, ERC20Migrator _migrator) public initializer {
    Ownable.initialize(msg.sender);
    ERC20Capped.initialize(_cap, address(_migrator));
    ERC20Detailed.initialize(_legacyToken.name(), _legacyToken.symbol(), _legacyToken.decimals());
  }

  function addMinter(address account) public onlyOwner {
      _addMinter(account);
  }

  function renounceMinter() public {
      _removeMinter(msg.sender);
  }

}
