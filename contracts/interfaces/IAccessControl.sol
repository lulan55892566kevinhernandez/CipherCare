// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IAccessControl
 * @dev Access control interface - responsible for role-based permission management
 * @notice Designed based on FHE knowledge base Chapter 11 ACL permission management
 */
interface IAccessControl {
    // ============ Role Definitions ============
    
    /// @notice System administrator role
    function GOVERNOR_ROLE() external pure returns (bytes32);
    
    /// @notice Benefit council role
    function COUNCIL_ROLE() external pure returns (bytes32);
    
    /// @notice Assessor role
    function ASSESSOR_ROLE() external pure returns (bytes32);
    
    /// @notice Auditor role
    function AUDITOR_ROLE() external pure returns (bytes32);
    
    /// @notice Member role
    function MEMBER_ROLE() external pure returns (bytes32);

    // ============ Event Definitions ============
    
    /// @notice Role granted event
    event RoleGranted(
        bytes32 indexed role,
        address indexed account,
        address indexed sender
    );
    
    /// @notice Role revoked event
    event RoleRevoked(
        bytes32 indexed role,
        address indexed account,
        address indexed sender
    );
    
    /// @notice Role renounced event
    event RoleRenounced(
        bytes32 indexed role,
        address indexed account
    );

    // ============ Error Definitions ============
    
    error UnauthorizedAccess();
    error InvalidRole();
    error RoleAlreadyGranted();
    error RoleNotGranted();

    // ============ Core Functions ============
    
    /**
     * @notice Grant role
     * @param role Role identifier
     * @param account Account address
     */
    function grantRole(bytes32 role, address account) external;

    /**
     * @notice Revoke role
     * @param role Role identifier
     * @param account Account address
     */
    function revokeRole(bytes32 role, address account) external;

    /**
     * @notice Renounce role
     * @param role Role identifier
     */
    function renounceRole(bytes32 role) external;

    /**
     * @notice Batch grant roles
     * @param role Role identifier
     * @param accounts Array of account addresses
     */
    function grantRoleBatch(bytes32 role, address[] calldata accounts) external;

    /**
     * @notice Batch revoke roles
     * @param role Role identifier
     * @param accounts Array of account addresses
     */
    function revokeRoleBatch(bytes32 role, address[] calldata accounts) external;

    // ============ Query Functions ============
    
    /**
     * @notice Check if account has role
     * @param role Role identifier
     * @param account Account address
     * @return hasRole Whether has role
     */
    function hasRole(bytes32 role, address account) external view returns (bool hasRole);

    /**
     * @notice Get role administrator
     * @param role Role identifier
     * @return admin Administrator address
     */
    function getRoleAdmin(bytes32 role) external view returns (bytes32 admin);

    /**
     * @notice Get role member count
     * @param role Role identifier
     * @return count Member count
     */
    function getRoleMemberCount(bytes32 role) external view returns (uint256 count);

    /**
     * @notice Get role member
     * @param role Role identifier
     * @param index Index
     * @return member Member address
     */
    function getRoleMember(bytes32 role, uint256 index) external view returns (address member);

    /**
     * @notice Get all role members
     * @param role Role identifier
     * @return members Array of member addresses
     */
    function getRoleMembers(bytes32 role) external view returns (address[] memory members);
}
