async function main() {

    const DailyGas = await ethers.getContractFactory("DailyGas");
 
 
    // Start deployment, returning a promise that resolves to a contract object
 
    const daily_gas = await DailyGas.deploy(0,0);
 
    console.log("Contract deployed to address:", daily_gas.address);}
 
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });
 
 