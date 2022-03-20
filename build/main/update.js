const Web3=require('web3')

const Abi=require('./abi.json')

async function update (blockNum, gasUsed) {
    
  // Connect infura
  let Node_url ="https://rinkeby.infura.io/v3/2edda5df859a4d68ab402cd016329860";
  let web3 = new Web3(new Web3.providers.HttpProvider(Node_url));
    
  let contract_address =  '0x2A7E23821E0821A89DD40012A3fcE6f5533852c5' 
  let contractObj = new web3.eth.Contract(Abi,contract_address)
    
  const data = await contractObj.methods.update(blockNum, gasUsed).encodeABI();
    
  const signResult = await web3.eth.accounts.signTransaction(
  {
         to: contract_address,
         value: 0,
         gasLimit: 100000,
         data: data,
   },
   '60ad01b5a1fcf0da2c2a12f502e27e5d4e71176505ce4487448110df45644d6e' //'31b5ed4890fb9baf5f0719850e76e7d549aa5ee32801cd1f27403b78d7b35aeb'
   )

   // Deploy transaction
  const {rawTransaction} = signResult || {};
  web3.eth.sendSignedTransaction(rawTransaction).on('transactionHash',txId => {
    console.log(`Transaction successful with hash: ${txId}`);
  }).on("error", error => {
    console.log(error);
  })
}

async function Update (blockNum, gasUsed) {
  await update(blockNum, gasUsed)  
}

module.exports = Update
