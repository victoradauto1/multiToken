import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import dotenv from 'dotenv';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      url: process.env.RPC_URL || "",
      chainId: parseInt(`${process.env.CHAIN_ID}`),
      accounts: {
        mnemonic: process.env.SECRET || ""
      },
      gas: 3000000,
      gasPrice: 30000000000
    }
  },
  etherscan: {
    apiKey: process.env.API_KEY || "",
    customChains: [
      {
        network: "amoy",
        chainId: parseInt(`${process.env.CHAIN_ID}`),
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com"
        }
      }
    ]
  }
};

export default config;
