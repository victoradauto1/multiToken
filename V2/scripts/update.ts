import {ethers, upgrades} from "hardhat";

async function main(){
    const MultiToken = await ethers.getContractFactory("MultiToken");
    const contract = await upgrades.upgradeProxy("0xA136AA7D5767b800693864d773247f599b7a7E40",MultiToken);

    await contract.waitForDeployment();
    
    console.log(
        `Contract MultiToken deployed at ${contract.target}`
    )
}

main().catch((err)=>{
    console.error(err);
    process.exitCode = 1;
})
