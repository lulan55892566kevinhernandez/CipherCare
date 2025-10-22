// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64} from "@fhevm/solidity/lib/FHE.sol";

contract SimpleTest {
    euint64 public value;
    
    function setValue() external {
        value = FHE.asEuint64(100);
    }
}



