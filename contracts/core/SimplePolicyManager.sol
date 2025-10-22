// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IAccessControl} from "../interfaces/IAccessControl.sol";

/**
 * @title SimplePolicyManager
 * @dev Simplified policy management contract without FHE for testing
 */
contract SimplePolicyManager {
    
    // ============ State Variables ============
    
    IAccessControl public accessControl;
    
    struct Policy {
        string name;                    // Policy name
        string description;            // Policy description
        bool isActive;                 // Active status
        uint256 maxAmount;             // Maximum benefit amount
        uint256 createdAt;             // Creation timestamp
        uint8 priority;                // Priority level
        address creator;                // Creator address
    }
    
    mapping(uint256 => Policy) public policies;
    uint256 public nextPolicyId = 1;
    
    // ============ Events ============
    
    event PolicyCreated(uint256 indexed policyId, string name, uint256 maxAmount, address creator);
    event PolicyUpdated(uint256 indexed policyId, string name, uint256 maxAmount);
    event PolicyActivated(uint256 indexed policyId);
    event PolicyDeactivated(uint256 indexed policyId);
    
    // ============ Modifiers ============
    
    modifier onlyAuthorized() {
        // Allow all addresses to create policies
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _accessControl) {
        accessControl = IAccessControl(_accessControl);
    }
    
    // ============ Core Functions ============
    
    function createPolicy(
        string memory name,
        string memory description,
        uint256 maxAmount
    ) external onlyAuthorized returns (uint256) {
        uint256 policyId = nextPolicyId++;
        
        policies[policyId] = Policy({
            name: name,
            description: description,
            isActive: true,
            maxAmount: maxAmount,
            createdAt: block.timestamp,
            priority: 1, // Default priority level
            creator: msg.sender
        });
        
        emit PolicyCreated(policyId, name, maxAmount, msg.sender);
        return policyId;
    }
    
    function updatePolicy(
        uint256 policyId,
        string memory name,
        string memory description,
        uint256 maxAmount
    ) external onlyAuthorized {
        require(policyId < nextPolicyId, "Policy does not exist");
        
        policies[policyId].name = name;
        policies[policyId].description = description;
        policies[policyId].maxAmount = maxAmount;
        
        emit PolicyUpdated(policyId, name, maxAmount);
    }
    
    function activatePolicy(uint256 policyId) external onlyAuthorized {
        require(policyId < nextPolicyId, "Policy does not exist");
        policies[policyId].isActive = true;
        emit PolicyActivated(policyId);
    }
    
    function deactivatePolicy(uint256 policyId) external onlyAuthorized {
        require(policyId < nextPolicyId, "Policy does not exist");
        policies[policyId].isActive = false;
        emit PolicyDeactivated(policyId);
    }
    
    // ============ View Functions ============
    
    function getPolicyDetails(uint256 policyId) external view returns (
        string memory name,
        string memory description,
        uint256 maxAmount,
        bool isActive
    ) {
        require(policyId < nextPolicyId, "Policy does not exist");
        Policy memory policy = policies[policyId];
        return (policy.name, policy.description, policy.maxAmount, policy.isActive);
    }
    
    function getPolicyCount() external view returns (uint256) {
        return nextPolicyId - 1;
    }
    
    function isPolicyActive(uint256 policyId) external view returns (bool) {
        if (policyId >= nextPolicyId) return false;
        return policies[policyId].isActive;
    }
    
    function getActivePolicies() external view returns (Policy[] memory) {
        uint256 activeCount = 0;
        
        // Count active policies
        for (uint256 i = 1; i < nextPolicyId; i++) {
            if (policies[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array with active policies
        Policy[] memory activePolicies = new Policy[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i < nextPolicyId; i++) {
            if (policies[i].isActive) {
                activePolicies[index] = policies[i];
                index++;
            }
        }
        
        return activePolicies;
    }
}



