# Daily-Gas

This typescript apps keep getting block information from ropsten and store the block information including transaction into a sqlite3 database.  After each day, it will get the total number blocks and total gas from sqlite3 database and update it to a smart contract.

To compile the typescipt source:
```
tsc
```

To run the code:
```
node build/main
```

# The problem in compiling web3-core update Transaction
see https://github.com/ChainSafe/web3.js/issues/4629

To tackle this problem, the Update smart contract part is using Javascript instead of typescript. The source code can be found in src/update.js

# Database structure
There are three databases, see the following create statement:
```
Create table block( block_id integer primary key,baseFeePerGas integer,difficulty integer, extraData text,gasLimit integer, gasUsed integer, hash text not null,logsBloom text, miner text, nonce text,parentHash text,receiptsRoot text,sha3Uncles text, size integer, stateRoot text, timestamp integer, totalDifficulty integer)
```
```
Create table transactions(block_id integer, transaction_id text);
```
```
Create table stats(block_id integer, date_s text, time_s text, gasUsed int, num_trans int);
```

# The Smart Contract
It is located at daily-gas/daily-gas/DailyGas.sol 

The deploy address of the DailyGas.sol in ropsten is 0x2A7E23821E0821A89DD40012A3fcE6f5533852c5

The please rename .env-sample to .env and update corresponding data to deploy smart contract.

