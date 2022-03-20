//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

contract DailyGas {
    uint256 private blockNum;
    uint256 private gasUsed;
    address owner;

    constructor(uint256 initBlockNum, uint256 initGasUsed) {
      owner = msg.sender;
      blockNum = initBlockNum;
      gasUsed = initGasUsed;
   }

   function update(uint256 initBlockNum, uint256 initGasUsed) public {
      require(msg.sender == owner, "Only owner can do this");
      blockNum = initBlockNum;
      gasUsed = initGasUsed;
   }
}
