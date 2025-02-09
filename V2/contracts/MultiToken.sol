// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {ERC1155BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import {ERC1155SupplyUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MultiToken is Initializable, ERC1155Upgradeable, ERC1155BurnableUpgradeable, OwnableUpgradeable, ERC1155SupplyUpgradeable  {
    uint public constant Alfa = 0;
    uint public constant Beta = 1;
    uint public constant Gama = 2;

    string public constant BASE_URL =
        "https://crimson-junior-gayal-634.mypinata.cloud/ipfs/";


    uint public tokenPrice;
    uint public maxSupply;
    address payable public recipient;


    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public {
        __ERC1155_init(BASE_URL);
        __ERC1155Burnable_init();
        __Ownable_init(msg.sender);
        __ERC1155Supply_init();
        tokenPrice = 0.01 ether;
        maxSupply = 50;
    }

    function mint(uint256 id) external payable {
        require(id < 3, "This token does not exist");
        require(totalSupply(id) < maxSupply, "Max supply reached");
        require(msg.value >= tokenPrice, "Insufficient payment");
        _mint(msg.sender, id, 1, "");
    }

    function uri(uint256 id) public pure override returns (string memory) {
        require(id < 3, "This token does not exist");
        return string.concat(BASE_URL, Strings.toString(id), ".json");
    }

    function withDraw() external onlyOwner {
        recipient = payable(owner());
        uint amount = address(this).balance;
        (bool success, ) = owner().call{value: amount}("");
        require(success == true, "Falied to wtihdraw");
    }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155Upgradeable, ERC1155SupplyUpgradeable)
    {
        super._update(from, to, ids, values);
    }
}
