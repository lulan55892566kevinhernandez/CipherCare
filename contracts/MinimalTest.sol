// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, euint256} from "@fhevm/solidity/lib/FHE.sol";

contract MinimalTest {
    euint64 public value;
    
    function setValue() external {
        euint256 temp = euint256.wrap(0);
        value = FHE.asEuint64(temp);
    }
}



