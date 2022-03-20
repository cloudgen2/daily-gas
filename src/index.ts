import Web3 from 'web3'
import * as sqlite from 'sqlite3'
const Update=require('./update')

const sqlite3 = sqlite.verbose()
const db=new sqlite3.Database("blockchain.sqlite3")

const reInit=() => {
  return new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/ec5771a16fb444a58f56be3f40f336a7"))
}

const sqliteCmd=(stmt: string) => {
  db.all(stmt,[], (err) => {
    if(err) {
      console.log(err)
    }
  })
}

let lastBlock=0
let oldDate=''

const prepareDb=() => {
  let stmt=`Create table block( block_id integer primary key,baseFeePerGas integer,difficulty integer, extraData text,gasLimit integer, gasUsed integer, hash text not null,logsBloom text, miner text, nonce text,parentHash text,receiptsRoot text,sha3Uncles text, size integer, stateRoot text, timestamp integer, totalDifficulty integer);`
  sqliteCmd(stmt)
  let stmt2=`Create table transactions(block_id integer, transaction_id text);`
  sqliteCmd(stmt2)
  let stmt3=`Create table stats(block_id integer, date_s text, time_s text, gasUsed int, num_trans int);`
  sqliteCmd(stmt3)
}

prepareDb()

async function main_loop() {
  let web3=reInit()
  let block=await web3.eth.getBlockNumber()
  if (lastBlock == 0 ){
    lastBlock = block - 1
  } 
  for (let b=lastBlock + 1; b<=block; b++){
    let blockInfo = await web3.eth.getBlock(b)
    let hash=blockInfo.hash
    let baseFeePerGas = blockInfo.baseFeePerGas
    let difficulty = blockInfo.difficulty
    let extraData = blockInfo.extraData
    let gasLimit = blockInfo.gasLimit
    let gasUsed = blockInfo.gasUsed
    let logsBloom = blockInfo.logsBloom
    let miner = blockInfo.miner
    let nonce = blockInfo.nonce
    let parentHash = blockInfo.parentHash
    let receiptsRoot = blockInfo.receiptsRoot
    let sha3Uncles = blockInfo.sha3Uncles
    let size = blockInfo.size
    let stateRoot = blockInfo.stateRoot
    let timestamp = blockInfo.timestamp
    let totalDifficulty = blockInfo.totalDifficulty
    console.log(`Get block ${b}, ${hash}`)
    //blockInfo.then(console.log)
    let stmt = `Insert into block (block_id,baseFeePerGas,difficulty,extraData,gasLimit,gasUsed,hash,logsBloom,miner,nonce,parentHash,receiptsRoot, sha3Uncles,size,stateRoot,timestamp,totalDifficulty) values("${b}","${baseFeePerGas}","${difficulty}","${extraData}","${gasLimit}","${gasUsed}","${hash}","${logsBloom}","${miner}","${nonce}","${parentHash}","${receiptsRoot}","${sha3Uncles}","${size}","${stateRoot}","${timestamp}","${totalDifficulty}");`
    sqliteCmd(stmt)
    let date = new Date(Number(timestamp) * 1000)
    let dateString = date.toISOString().slice(0, 10)
    let timeString = date.toISOString().slice(0, 19).replace(/^[^T]*T/g,'')
    let trans = blockInfo.transactions
    let num_trans= trans.length
    console.log(`Timestamp: ${dateString} ${timeString} . `)
    let stmt2 = `Insert into stats(block_id, date_s,time_s, gasUsed, num_trans) values ("${b}","${dateString}","${timeString}","${gasUsed}","${num_trans}");`
    sqliteCmd(stmt2)
    for( let i = 0; i< num_trans; i++) {
      let trans_id = trans[i]
      let stmt3 = `Insert into transactions(block_id, transaction_id) values("${b}","${trans_id}");`
      sqliteCmd(stmt3)
    }
    lastBlock = b
    if (oldDate!='' && oldDate != dateString){
      get_stats(oldDate)
    } else {
      oldDate=dateString
    }
  }
}

const get_stats=(oldDate: string) => {
  let stmt = `Select count(block_id) as totalBlock, sum(gasUsed) as totalGas,sum(num_trans) as totalTran from stats where date_s="${oldDate}";`
  db.all(stmt, [], (err,rows) => {
    if(err){
      console.log(err)
    }else{
      rows.forEach((row) => {
        let totalGas = row.totalGas
	let totalTran = row.totalTran
	let totalBlock = row.totalBlock
	Update(totalTran,totalGas).catch(console.error).finally(() => {console.log('done')})
        console.log(`${totalBlock} Total Gas: ${totalGas} and total trans: ${totalTran}`);
      })
    }
  })
}

setInterval(() => {
  main_loop().catch(e=>console.error(e))
}, 2000)

