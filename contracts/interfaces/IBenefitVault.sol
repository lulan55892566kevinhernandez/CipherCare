// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IBenefitVault
 * @dev Core interface for benefit vault - responsible for benefit data storage and management
 * @notice Simplified version without FHE dependencies
 */
interface IBenefitVault {
    
    // ============ Event Definitions ============
    
    /// @notice Benefit record submission event
    event BenefitSubmitted(
        bytes32 indexed benefitId,
        address indexed member,
        bytes32 indexed programKey,
        uint256 timestamp
    );
    
    /// @notice Benefit record update event
    event BenefitUpdated(
        bytes32 indexed benefitId,
        address indexed member,
        bytes32 indexed programKey,
        uint256 timestamp
    );
    
    /// @notice Benefit record freeze/unfreeze event
    event BenefitFrozen(
        bytes32 indexed benefitId,
        bool frozen,
        uint256 timestamp
    );
    
    /// @notice Benefit record flag event
    event BenefitFlagged(
        bytes32 indexed benefitId,
        bool flagged,
        uint256 timestamp
    );

    // ============ Error Definitions ============
    
    error BenefitNotFound();
    error BenefitAlreadyExists();
    error BenefitFrozenError();
    error BenefitFlaggedError();
    error UnauthorizedAccess();
    error InvalidProgramKey();
    error InvalidBenefitData();

    // ============ Core Functions ============
    
    /**
     * @notice Store benefit record
     * @param member Member address
     * @param encryptedData Encrypted benefit data
     * @param policyId Policy ID
     */
    function storeBenefitRecord(
        address member,
        bytes calldata encryptedData,
        uint256 policyId
    ) external;
    
    /**
     * @notice Update benefit record
     * @param member Member address
     * @param index Benefit record index
     * @param encryptedData New encrypted data
     */
    function updateBenefitRecord(
        address member,
        uint256 index,
        bytes calldata encryptedData
    ) external;
    
    /**
     * @notice Freeze benefit record
     * @param member Member address
     * @param index Benefit record index
     */
    function freezeBenefitRecord(address member, uint256 index) external;
    
    /**
     * @notice Flag benefit record
     * @param member Member address
     * @param index Benefit record index
     */
    function flagBenefitRecord(address member, uint256 index) external;

    // ============ View Functions ============
    
    /**
     * @notice Get member benefit count
     * @param member Member address
     * @return count Number of benefit records
     */
    function getMemberBenefitCount(address member) external view returns (uint256);
    
    /**
     * @notice Get benefit record
     * @param member Member address
     * @param index Benefit record index
     * @return encryptedData Encrypted benefit data
     * @return policyId Policy ID
     * @return timestamp Creation timestamp
     * @return status Benefit status
     */
    function getBenefitRecord(address member, uint256 index) external view returns (
        bytes memory encryptedData,
        uint256 policyId,
        uint256 timestamp,
        uint8 status
    );
    
    /**
     * @notice Get all member benefits
     * @param member Member address
     * @return encryptedDataList Array of encrypted data
     * @return policyIds Array of policy IDs
     * @return timestamps Array of timestamps
     * @return statuses Array of statuses
     */
    function getMemberBenefits(address member) external view returns (
        bytes[] memory encryptedDataList,
        uint256[] memory policyIds,
        uint256[] memory timestamps,
        uint8[] memory statuses
    );
    
    /**
     * @notice Get total benefits
     * @return totalBenefits Total benefit count
     */
    function getTotalBenefits() external view returns (uint256);
}