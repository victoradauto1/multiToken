// verify.ts
import { run } from "hardhat";

async function main() {
  const PROXY_ADDRESS = "0x5A20C050f3D52687542360d294da842AE4F45731";
  
  console.log("Aguardando algumas confirmações...");
  // Aguarde alguns blocos
  await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minuto

  console.log("Iniciando verificação...");
  try {
    await run("verify:verify", {
      address: PROXY_ADDRESS,
      constructorArguments: []
    });
  } catch (e) {
    console.log("Erro na verificação:", e);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });