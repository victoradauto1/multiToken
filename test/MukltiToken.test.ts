import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { erc1155 } from "../typechain-types/@openzeppelin/contracts/token";

describe("MultiToken", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const MultiToken = await hre.ethers.getContractFactory("MultiToken");
    const contract = await MultiToken.deploy();

    return { contract, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should mint", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      await contract.mint(0, { value: ethers.parseEther("0.01") });

      const balance = await contract.balanceOf(owner, 0);
      const supply = await contract.currentSupply(0);

      expect(balance).to.equal(1, "cannot mint");
      expect(supply).to.equal(49, "cannot mint");
    });

    it("Should NOT mint (exists)", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      await expect(
        contract.mint(4, { value: ethers.parseEther("0.01") })
      ).to.be.revertedWith("This token does not exist");
    });

    it("Should NOT mint (supply)", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      for (let i = 0; i < 50; i++) {
        await contract.mint(0, { value: ethers.parseEther("0.01") });
      }

      await expect(
        contract.mint(0, { value: ethers.parseEther("0.01") })
      ).to.be.revertedWith("Max supply reached");
    });

    it("Should NOT mint (payament)", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      await expect(contract.mint(0)).to.be.revertedWith("Insufficient payment");
    });

    it("Should burn", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      await contract.mint(0, { value: ethers.parseEther("0.01") });

      await contract.burn(owner, 0, 1);

      const balance = await contract.balanceOf(owner, 0);
      const supply = await contract.currentSupply(0);

      expect(balance).to.equal(0, "Cannot burn");
      expect(supply).to.equal(49, "Cannot burn");
    });

    it("Should burn (approved)", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      await contract.mint(0, { value: ethers.parseEther("0.01") });

      await contract.setApprovalForAll(otherAccount, true);

      const approved = await contract.isApprovedForAll(owner, otherAccount);
      const instance = contract.connect(otherAccount);
      await instance.burn(owner, 0, 1);

      const balance = await contract.balanceOf(owner, 0);
      const supply = await contract.currentSupply(0);

      expect(approved).to.equal(true, "Cannot burn(approved)");
      expect(balance).to.equal(0, "Cannot burn(approved)");
      expect(supply).to.equal(49, "Cannot burn(approved)");
    });

    it("Should NOT burn (balance)", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      await expect(contract.burn(owner, 0, 1)).to.be.revertedWithCustomError(
        contract,
        "ERC1155InsufficientBalance"
      );
    });

    it("Should NOT burn (approved)", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      await contract.mint(0, { value: ethers.parseEther("0.01") });

      const instance = contract.connect(otherAccount);
      await expect(instance.burn(owner, 0, 1)).to.be.revertedWithCustomError(
        contract,
        "ERC1155MissingApprovalForAll"
      );
    });

    it("Should transfer", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      await contract.mint(0, { value: ethers.parseEther("0.01") });

      await contract.safeTransferFrom(
        owner,
        otherAccount,
        0,
        1,
        ethers.ZeroAddress
      );

      const balance = await contract.balanceOfBatch(
        [owner, otherAccount],
        [0, 0]
      );
      const supply = await contract.currentSupply(0);

      expect(balance[0]).to.equal(0, "Cannot Safe Trans");
      expect(balance[1]).to.equal(1, "Cannot Safe Trans");
      expect(supply).to.equal(49, "Cannot Safe Trans");
    });

    it("Should emit transfer", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      await contract.mint(0, { value: ethers.parseEther("0.01") });

      expect(
        await contract.safeTransferFrom(
          owner,
          otherAccount,
          0,
          1,
          ethers.ZeroAddress
        )
      )
        .to.emit(contract, "TransferSingle")
        .withArgs(owner, otherAccount, 0, 1);
    });

    
    it("Should NOT transfer (balance)", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      await expect(contract.safeTransferFrom(
        owner,
        otherAccount,
        0,
        1,
        ethers.ZeroAddress
      )).to.be.revertedWithCustomError(contract,"ERC1155InsufficientBalance" );
    });

    it("Should NOT transfer (exists)", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      await expect(contract.safeTransferFrom(
        owner,
        otherAccount,
        10,
        1,
        ethers.ZeroAddress
      )).to.be.revertedWithCustomError(contract,"ERC1155InsufficientBalance" );
    });


    it("Should NOT transfer (permission)", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      const instance = contract.connect(otherAccount);

      await expect(instance.safeTransferFrom(
        owner,
        otherAccount,
        0,
        1,
        ethers.ZeroAddress
      )).to.be.revertedWithCustomError(contract,"ERC1155MissingApprovalForAll");
    });

    it("Should NOT transfer batch (mismatch array)", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      await contract.mint(0, { value: ethers.parseEther("0.01") });
      await contract.mint(1, { value: ethers.parseEther("0.01") });

      await expect(contract.safeBatchTransferFrom(
        owner,
        otherAccount,
        [0,1],
        [1],
        ethers.ZeroAddress
      )).to.be.revertedWithCustomError(contract,"ERC1155InvalidArrayLength");
    });

    it("Should NOT transfer batch (mismatch array 2)", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      await contract.mint(0, { value: ethers.parseEther("0.01") });
      await contract.mint(1, { value: ethers.parseEther("0.01") });

      await expect(contract.safeBatchTransferFrom(
        owner,
        otherAccount,
        [1],
        [1,1],
        ethers.ZeroAddress
      )).to.be.revertedWithCustomError(contract,"ERC1155InvalidArrayLength");
    });

    it("Should NOT transfer batch (permission)", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      await contract.mint(0, { value: ethers.parseEther("0.01") });
      await contract.mint(1, { value: ethers.parseEther("0.01") });

      const instance = contract.connect(otherAccount);
      await expect(instance.safeBatchTransferFrom(
        owner,
        otherAccount,
        [0,1],
        [1,1],
        ethers.ZeroAddress
      )).to.be.revertedWithCustomError(contract,"ERC1155MissingApprovalForAll");
    });

    it("Should support interfaces", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );
      const support = await contract.supportsInterface("0xd9b67a26");

      expect(support).to.equal(true, "Does not support interface ERC-1155");
    });

    it("Should withdraw", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );
      
      const instance = contract.connect(otherAccount);
      await instance.mint(0, { value: ethers.parseEther("0.01") });

      const balanceContractBefore = await ethers.provider.getBalance(contract);
      const balanceOwnerBefore = await ethers.provider.getBalance(owner);

      await contract.withDraw();

      const balanceContractAfter = await ethers.provider.getBalance(contract);
      const balanceOwnerAfter = await ethers.provider.getBalance(owner);

      expect(balanceContractBefore).to.equal(ethers.parseEther("0.01"), "Cannot withDraw");
      expect(balanceContractAfter).to.equal(0, "Cannot withDraw");
      expect(balanceOwnerAfter).to.greaterThan(balanceOwnerBefore, "Cannot withDraw");
    });
    
    it("Should NOT withdraw (permission)", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      const instance = contract.connect(otherAccount);

      await expect(instance.withDraw()).to.be.revertedWith("You do not have permission");
    });

    it("Should has uri metadata", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      const uri = await contract.uri(0);

      expect(uri).to.equal("https://crimson-junior-gayal-634.mypinata.cloud/ipfs/0.json", "Does not have uri");
    });

    it("Should NOT has uri metadata", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      await expect(contract.uri(10)).to.be.revertedWith("This token does not exist");
    });

  });
});
