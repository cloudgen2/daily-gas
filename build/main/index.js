"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = __importDefault(require("web3"));
const sqlite = __importStar(require("sqlite3"));
const Update = require('./update');
const sqlite3 = sqlite.verbose();
const db = new sqlite3.Database("blockchain.sqlite3");
const reInit = () => {
    return new web3_1.default(new web3_1.default.providers.HttpProvider("https://rinkeby.infura.io/v3/ec5771a16fb444a58f56be3f40f336a7"));
};
const sqliteCmd = (stmt) => {
    db.all(stmt, [], (err) => {
        if (err) {
            console.log(err);
        }
    });
};
let lastBlock = 0;
let oldDate = '';
const prepareDb = () => {
    let stmt = `Create table block( block_id integer primary key,baseFeePerGas integer,difficulty integer, extraData text,gasLimit integer, gasUsed integer, hash text not null,logsBloom text, miner text, nonce text,parentHash text,receiptsRoot text,sha3Uncles text, size integer, stateRoot text, timestamp integer, totalDifficulty integer);`;
    sqliteCmd(stmt);
    let stmt2 = `Create table transactions(block_id integer, transaction_id text);`;
    sqliteCmd(stmt2);
    let stmt3 = `Create table stats(block_id integer, date_s text, time_s text, gasUsed int, num_trans int);`;
    sqliteCmd(stmt3);
};
prepareDb();
async function main_loop() {
    let web3 = reInit();
    let block = await web3.eth.getBlockNumber();
    if (lastBlock == 0) {
        lastBlock = block - 1;
    }
    for (let b = lastBlock + 1; b <= block; b++) {
        let blockInfo = await web3.eth.getBlock(b);
        let hash = blockInfo.hash;
        let baseFeePerGas = blockInfo.baseFeePerGas;
        let difficulty = blockInfo.difficulty;
        let extraData = blockInfo.extraData;
        let gasLimit = blockInfo.gasLimit;
        let gasUsed = blockInfo.gasUsed;
        let logsBloom = blockInfo.logsBloom;
        let miner = blockInfo.miner;
        let nonce = blockInfo.nonce;
        let parentHash = blockInfo.parentHash;
        let receiptsRoot = blockInfo.receiptsRoot;
        let sha3Uncles = blockInfo.sha3Uncles;
        let size = blockInfo.size;
        let stateRoot = blockInfo.stateRoot;
        let timestamp = blockInfo.timestamp;
        let totalDifficulty = blockInfo.totalDifficulty;
        console.log(`Get block ${b}, ${hash}`);
        //blockInfo.then(console.log)
        let stmt = `Insert into block (block_id,baseFeePerGas,difficulty,extraData,gasLimit,gasUsed,hash,logsBloom,miner,nonce,parentHash,receiptsRoot, sha3Uncles,size,stateRoot,timestamp,totalDifficulty) values("${b}","${baseFeePerGas}","${difficulty}","${extraData}","${gasLimit}","${gasUsed}","${hash}","${logsBloom}","${miner}","${nonce}","${parentHash}","${receiptsRoot}","${sha3Uncles}","${size}","${stateRoot}","${timestamp}","${totalDifficulty}");`;
        sqliteCmd(stmt);
        let date = new Date(Number(timestamp) * 1000);
        let dateString = date.toISOString().slice(0, 10);
        let timeString = date.toISOString().slice(0, 19).replace(/^[^T]*T/g, '');
        let trans = blockInfo.transactions;
        let num_trans = trans.length;
        console.log(`Timestamp: ${dateString} ${timeString} . `);
        let stmt2 = `Insert into stats(block_id, date_s,time_s, gasUsed, num_trans) values ("${b}","${dateString}","${timeString}","${gasUsed}","${num_trans}");`;
        sqliteCmd(stmt2);
        for (let i = 0; i < num_trans; i++) {
            let trans_id = trans[i];
            let stmt3 = `Insert into transactions(block_id, transaction_id) values("${b}","${trans_id}");`;
            sqliteCmd(stmt3);
        }
        lastBlock = b;
        if (oldDate != '' && oldDate != dateString) {
            get_stats(oldDate);
        }
        else {
            oldDate = dateString;
        }
    }
}
const get_stats = (oldDate) => {
    let stmt = `Select count(block_id) as totalBlock, sum(gasUsed) as totalGas,sum(num_trans) as totalTran from stats where date_s="${oldDate}";`;
    db.all(stmt, [], (err, rows) => {
        if (err) {
            console.log(err);
        }
        else {
            rows.forEach((row) => {
                let totalGas = row.totalGas;
                let totalTran = row.totalTran;
                let totalBlock = row.totalBlock;
                Update(totalTran, totalGas).catch(console.error).finally(() => { console.log('done'); });
                console.log(`${totalBlock} Total Gas: ${totalGas} and total trans: ${totalTran}`);
            });
        }
    });
};
setInterval(() => {
    main_loop().catch(e => console.error(e));
}, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGdEQUF1QjtBQUN2QixnREFBaUM7QUFDakMsTUFBTSxNQUFNLEdBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBRWhDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUNoQyxNQUFNLEVBQUUsR0FBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtBQUVuRCxNQUFNLE1BQU0sR0FBQyxHQUFHLEVBQUU7SUFDaEIsT0FBTyxJQUFJLGNBQUksQ0FBQyxJQUFJLGNBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLCtEQUErRCxDQUFDLENBQUMsQ0FBQTtBQUNuSCxDQUFDLENBQUE7QUFFRCxNQUFNLFNBQVMsR0FBQyxDQUFDLElBQVksRUFBRSxFQUFFO0lBQy9CLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO1FBQ3RCLElBQUcsR0FBRyxFQUFFO1lBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUNqQjtJQUNILENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFBO0FBRUQsSUFBSSxTQUFTLEdBQUMsQ0FBQyxDQUFBO0FBQ2YsSUFBSSxPQUFPLEdBQUMsRUFBRSxDQUFBO0FBRWQsTUFBTSxTQUFTLEdBQUMsR0FBRyxFQUFFO0lBQ25CLElBQUksSUFBSSxHQUFDLHNVQUFzVSxDQUFBO0lBQy9VLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNmLElBQUksS0FBSyxHQUFDLG1FQUFtRSxDQUFBO0lBQzdFLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNoQixJQUFJLEtBQUssR0FBQyw2RkFBNkYsQ0FBQTtJQUN2RyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDbEIsQ0FBQyxDQUFBO0FBRUQsU0FBUyxFQUFFLENBQUE7QUFFWCxLQUFLLFVBQVUsU0FBUztJQUN0QixJQUFJLElBQUksR0FBQyxNQUFNLEVBQUUsQ0FBQTtJQUNqQixJQUFJLEtBQUssR0FBQyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUE7SUFDekMsSUFBSSxTQUFTLElBQUksQ0FBQyxFQUFFO1FBQ2xCLFNBQVMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFBO0tBQ3RCO0lBQ0QsS0FBSyxJQUFJLENBQUMsR0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUM7UUFDdEMsSUFBSSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUMxQyxJQUFJLElBQUksR0FBQyxTQUFTLENBQUMsSUFBSSxDQUFBO1FBQ3ZCLElBQUksYUFBYSxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUE7UUFDM0MsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQTtRQUNyQyxJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFBO1FBQ25DLElBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUE7UUFDakMsSUFBSSxPQUFPLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQTtRQUMvQixJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFBO1FBQ25DLElBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUE7UUFDM0IsSUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQTtRQUMzQixJQUFJLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFBO1FBQ3JDLElBQUksWUFBWSxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUE7UUFDekMsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQTtRQUNyQyxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFBO1FBQ3pCLElBQUksU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUE7UUFDbkMsSUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQTtRQUNuQyxJQUFJLGVBQWUsR0FBRyxTQUFTLENBQUMsZUFBZSxDQUFBO1FBQy9DLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQTtRQUN0Qyw2QkFBNkI7UUFDN0IsSUFBSSxJQUFJLEdBQUcsb01BQW9NLENBQUMsTUFBTSxhQUFhLE1BQU0sVUFBVSxNQUFNLFNBQVMsTUFBTSxRQUFRLE1BQU0sT0FBTyxNQUFNLElBQUksTUFBTSxTQUFTLE1BQU0sS0FBSyxNQUFNLEtBQUssTUFBTSxVQUFVLE1BQU0sWUFBWSxNQUFNLFVBQVUsTUFBTSxJQUFJLE1BQU0sU0FBUyxNQUFNLFNBQVMsTUFBTSxlQUFlLEtBQUssQ0FBQTtRQUNoYyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDZixJQUFJLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDN0MsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDaEQsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBQyxFQUFFLENBQUMsQ0FBQTtRQUN2RSxJQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFBO1FBQ2xDLElBQUksU0FBUyxHQUFFLEtBQUssQ0FBQyxNQUFNLENBQUE7UUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLFVBQVUsSUFBSSxVQUFVLEtBQUssQ0FBQyxDQUFBO1FBQ3hELElBQUksS0FBSyxHQUFHLDJFQUEyRSxDQUFDLE1BQU0sVUFBVSxNQUFNLFVBQVUsTUFBTSxPQUFPLE1BQU0sU0FBUyxLQUFLLENBQUE7UUFDekosU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ2hCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDakMsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3ZCLElBQUksS0FBSyxHQUFHLDhEQUE4RCxDQUFDLE1BQU0sUUFBUSxLQUFLLENBQUE7WUFDOUYsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFBO1NBQ2pCO1FBQ0QsU0FBUyxHQUFHLENBQUMsQ0FBQTtRQUNiLElBQUksT0FBTyxJQUFFLEVBQUUsSUFBSSxPQUFPLElBQUksVUFBVSxFQUFDO1lBQ3ZDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtTQUNuQjthQUFNO1lBQ0wsT0FBTyxHQUFDLFVBQVUsQ0FBQTtTQUNuQjtLQUNGO0FBQ0gsQ0FBQztBQUVELE1BQU0sU0FBUyxHQUFDLENBQUMsT0FBZSxFQUFFLEVBQUU7SUFDbEMsSUFBSSxJQUFJLEdBQUcsdUhBQXVILE9BQU8sSUFBSSxDQUFBO0lBQzdJLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBQyxJQUFJLEVBQUUsRUFBRTtRQUM1QixJQUFHLEdBQUcsRUFBQztZQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7U0FDakI7YUFBSTtZQUNILElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDbkIsSUFBSSxRQUFRLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQTtnQkFDbEMsSUFBSSxTQUFTLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQTtnQkFDN0IsSUFBSSxVQUFVLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQTtnQkFDL0IsTUFBTSxDQUFDLFNBQVMsRUFBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBLENBQUEsQ0FBQyxDQUFDLENBQUE7Z0JBQzdFLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLGVBQWUsUUFBUSxxQkFBcUIsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUNwRixDQUFDLENBQUMsQ0FBQTtTQUNIO0lBQ0gsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUE7QUFFRCxXQUFXLENBQUMsR0FBRyxFQUFFO0lBQ2YsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQSxFQUFFLENBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3hDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQSJ9