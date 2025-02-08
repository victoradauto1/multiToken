// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Burnable} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MultiToken is ERC1155, ERC1155Burnable {
    uint public constant Alfa = 0;
    uint public constant Beta = 1;
    uint public constant Gama = 2;

    string public constant BASE_URL =
        "https://crimson-junior-gayal-634.mypinata.cloud/ipfs/";

    uint[] public currentSupply = [50, 50, 50];

    uint public tokenPrice = 0.01 ether;

    address payable public immutable owner;

    constructor() ERC1155(BASE_URL) {
        owner = payable(msg.sender);
    }

    function mint(uint256 id) external payable {
        require(id < 3, "This token does not exist");
        require(currentSupply[id] > 0, "Max supply reached");
        require(msg.value >= tokenPrice, "Insufficient payment");
        _mint(msg.sender, id, 1, "");

        currentSupply[id] -= 1;
    }

    function uri(uint256 id) public pure override returns (string memory) {
        require(id < 3, "This token does not exist");
        return string.concat(BASE_URL, Strings.toString(id), ".json");
    }

    function withDraw() external {
        require(msg.sender == owner, "You do not have permission");

        uint amount = address(this).balance;
        (bool success, ) = owner.call{value: amount}("");
        require(success == true, "Falied to wtihdraw");
    }
}
