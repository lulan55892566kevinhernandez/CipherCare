// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, euint32, euint8} from "@fhevm/solidity/lib/FHE.sol";

contract FHETest {
    euint64 public encryptedValue;
    
    function setValue(uint64 value) external {
        encryptedValue = FHE.asEuint64(value);
    }
    
    function addValue(uint64 amount) external {
        euint64 additional = FHE.asEuint64(amount);
        encryptedValue = FHE.add(encryptedValue, additional);
    }
}