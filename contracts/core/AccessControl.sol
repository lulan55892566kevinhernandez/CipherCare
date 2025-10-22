// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IAccessControl} from "../interfaces/IAccessControl.sol";

/**
 * @title AccessControl
 * @dev Access control contract - role-based permission management
 * @notice Designed based on FHE knowledge base Chapter 11 ACL permission management
 */
contract AccessControl is IAccessControl {
    // ============ Role Constants ============
    
    /// @notice System administrator role
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
    
    /// @notice Benefit council role
    bytes32 public constant COUNCIL_ROLE = keccak256("COUNCIL_ROLE");
    
    /// @notice Assessor role
    bytes32 public constant ASSESSOR_ROLE = keccak256("ASSESSOR_ROLE");
    
    /// @notice Auditor role
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    
    /// @notice Member role
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");

    // ============ State Variables ============
    
    /// @notice Mapping from roles to members
    mapping(bytes32 => mapping(address => bool)) private _roles;
    
    /// @notice Role member list
    mapping(bytes32 => address[]) private _roleMembers;
    
    /// @notice Role member index
    mapping(bytes32 => mapping(address => uint256)) private _roleMemberIndex;
    
    /// @notice Role administrator mapping
    mapping(bytes32 => bytes32) private _roleAdmins;

    // ============ Modifiers ============
    
    modifier onlyRole(bytes32 role) {
        if (!hasRole(role, msg.sender)) {
            revert UnauthorizedAccess();
        }
        _;
    }

    // ============ Constructor ============
    
    constructor() {
        // Set default role administrators
        _roleAdmins[GOVERNOR_ROLE] = GOVERNOR_ROLE;
        _roleAdmins[COUNCIL_ROLE] = GOVERNOR_ROLE;
        _roleAdmins[ASSESSOR_ROLE] = COUNCIL_ROLE;
        _roleAdmins[AUDITOR_ROLE] = GOVERNOR_ROLE;
        _roleAdmins[MEMBER_ROLE] = COUNCIL_ROLE;
        
        // Deployer automatically gets administrator role
        _grantRole(GOVERNOR_ROLE, msg.sender);
    }

    // ============ Core Functions ============
    
    /**
     * @notice Grant role
     * @dev Based on FHE knowledge base Chapter 11.1 three permission methods design
     */
    function grantRole(bytes32 role, address account) external override onlyRole(getRoleAdmin(role)) {
        if (hasRole(role, account)) {
            revert RoleAlreadyGranted();
        }
        _grantRole(role, account);
    }

    /**
     * @notice Revoke role
     */
    function revokeRole(bytes32 role, address account) external override onlyRole(getRoleAdmin(role)) {
        if (!hasRole(role, account)) {
            revert RoleNotGranted();
        }
        _revokeRole(role, account);
    }

    /**
     * @notice Renounce role
     */
    function renounceRole(bytes32 role) external override {
        if (!hasRole(role, msg.sender)) {
            revert RoleNotGranted();
        }
        _revokeRole(role, msg.sender);
    }

    /**
     * @notice Batch grant roles
     */
    function grantRoleBatch(bytes32 role, address[] calldata accounts) external override onlyRole(getRoleAdmin(role)) {
        for (uint256 i = 0; i < accounts.length; i++) {
            if (!hasRole(role, accounts[i])) {
                _grantRole(role, accounts[i]);
            }
        }
    }

    /**
     * @notice Batch revoke roles
     */
    function revokeRoleBatch(bytes32 role, address[] calldata accounts) external override onlyRole(getRoleAdmin(role)) {
        for (uint256 i = 0; i < accounts.length; i++) {
            if (hasRole(role, accounts[i])) {
                _revokeRole(role, accounts[i]);
            }
        }
    }

    // ============ Query Functions ============
    
    /**
     * @notice Check if account has role
     */
    function hasRole(bytes32 role, address account) public view override returns (bool) {
        return _roles[role][account];
    }

    /**
     * @notice Get role administrator
     */
    function getRoleAdmin(bytes32 role) public view override returns (bytes32) {
        return _roleAdmins[role];
    }

    /**
     * @notice Get role member count
     */
    function getRoleMemberCount(bytes32 role) public view override returns (uint256) {
        return _roleMembers[role].length;
    }

    /**
     * @notice Get role member
     */
    function getRoleMember(bytes32 role, uint256 index) public view override returns (address) {
        if (index >= _roleMembers[role].length) {
            return address(0);
        }
        return _roleMembers[role][index];
    }

    /**
     * @notice Get all role members
     */
    function getRoleMembers(bytes32 role) public view override returns (address[] memory) {
        return _roleMembers[role];
    }

    // ============ Internal Functions ============
    
    /**
     * @notice Internal grant role function
     */
    function _grantRole(bytes32 role, address account) internal {
        if (!hasRole(role, account)) {
            _roles[role][account] = true;
            _roleMembers[role].push(account);
            _roleMemberIndex[role][account] = _roleMembers[role].length - 1;
            emit RoleGranted(role, account, msg.sender);
        }
    }

    /**
     * @notice Internal revoke role function
     */
    function _revokeRole(bytes32 role, address account) internal {
        if (hasRole(role, account)) {
            _roles[role][account] = false;
            
            // Remove from member list
            uint256 index = _roleMemberIndex[role][account];
            uint256 lastIndex = _roleMembers[role].length - 1;
            
            if (index != lastIndex) {
                address lastMember = _roleMembers[role][lastIndex];
                _roleMembers[role][index] = lastMember;
                _roleMemberIndex[role][lastMember] = index;
            }
            
            _roleMembers[role].pop();
            delete _roleMemberIndex[role][account];
            
            emit RoleRevoked(role, account, msg.sender);
        }
    }
}
