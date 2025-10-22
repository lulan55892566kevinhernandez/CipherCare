// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IPolicyManager
 * @dev Policy management interface - responsible for benefit policy definition and management
 * @notice Simplified version without FHE dependencies
 */
interface IPolicyManager {
    
    // ============ Event Definitions ============
    
    /// @notice Policy created event
    event PolicyCreated(uint256 indexed policyId, string name, uint256 maxAmount, address creator);
    
    /// @notice Policy updated event
    event PolicyUpdated(uint256 indexed policyId, string name, uint256 maxAmount);
    
    /// @notice Policy activated event
    event PolicyActivated(uint256 indexed policyId);
    
    /// @notice Policy deactivated event
    event PolicyDeactivated(uint256 indexed policyId);

    // ============ Error Definitions ============
    
    error PolicyNotFound();
    error PolicyAlreadyExists();
    error UnauthorizedAccess();
    error InvalidPolicyData();

    // ============ Core Functions ============
    
    /**
     * @notice Create a new policy
     * @param name Policy name
     * @param description Policy description
     * @param maxAmount Maximum benefit amount
     * @return policyId Created policy ID
     */
    function createPolicy(
        string memory name,
        string memory description,
        uint256 maxAmount
    ) external returns (uint256);
    
    /**
     * @notice Update policy details
     * @param policyId Policy ID
     * @param name New policy name
     * @param description New policy description
     * @param maxAmount New maximum amount
     */
    function updatePolicy(
        uint256 policyId,
        string memory name,
        string memory description,
        uint256 maxAmount
    ) external;
    
    /**
     * @notice Activate a policy
     * @param policyId Policy ID
     */
    function activatePolicy(uint256 policyId) external;
    
    /**
     * @notice Deactivate a policy
     * @param policyId Policy ID
     */
    function deactivatePolicy(uint256 policyId) external;

    // ============ View Functions ============
    
    /**
     * @notice Get policy details
     * @param policyId Policy ID
     * @return name Policy name
     * @return description Policy description
     * @return isActive Whether policy is active
     * @return maxAmount Maximum benefit amount
     */
    function getPolicyDetails(uint256 policyId) external view returns (
        string memory name,
        string memory description,
        bool isActive,
        uint256 maxAmount
    );
    
    /**
     * @notice Check if policy is active
     * @param policyId Policy ID
     * @return isActive Whether policy is active
     */
    function isPolicyActive(uint256 policyId) external view returns (bool);
    
    /**
     * @notice Get all active policies
     * @return policyIds Array of policy IDs
     * @return names Array of policy names
     * @return descriptions Array of policy descriptions
     * @return isActive Array of active statuses
     * @return maxAmounts Array of maximum amounts
     */
    function getActivePolicies() external view returns (
        uint256[] memory policyIds,
        string[] memory names,
        string[] memory descriptions,
        bool[] memory isActive,
        uint256[] memory maxAmounts
    );
    
    /**
     * @notice Get total number of policies
     * @return totalPolicies Total policy count
     */
    function getTotalPolicies() external view returns (uint256);
}