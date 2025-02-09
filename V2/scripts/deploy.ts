import {ethers, upgrades} from "hardhat";

async function main(){
    const MultiToken = await ethers.getContractFactory("MultiToken");
    const contract = await upgrades.deployProxy(MultiToken);

    await contract.waitForDeployment();
    
    console.log(
        `Contract MultiToken deployed at ${contract.target}`
    )
}

main().catch((err)=>{
    console.error(err);
    process.exitCode = 1;
})
