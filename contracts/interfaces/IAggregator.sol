// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IAggregator
 * @dev Aggregation interface - responsible for benefit statistics aggregation and reserve management
 * @notice Simplified version without FHE dependencies
 */
interface IAggregator {
    
    // ============ Event Definitions ============
    
    /// @notice Statistics updated event
    event StatsUpdated(
        uint256 totalMembers,
        uint256 totalBenefits,
        uint256 totalAmount,
        uint256 timestamp
    );
    
    /// @notice Reserve updated event
    event ReserveUpdated(
        uint256 newReserve,
        uint256 timestamp
    );

    // ============ Error Definitions ============
    
    error UnauthorizedAccess();
    error InvalidStatsData();
    error InsufficientReserve();

    // ============ Core Functions ============
    
    /**
     * @notice Update aggregated statistics
     * @param totalMembers Total member count
     * @param totalBenefits Total benefit count
     * @param totalAmount Total benefit amount
     */
    function updateStats(
        uint256 totalMembers,
        uint256 totalBenefits,
        uint256 totalAmount
    ) external;
    
    /**
     * @notice Update obfuscated reserve
     * @param newReserve New reserve amount
     */
    function updateObfuscatedReserve(uint256 newReserve) external;
    
    /**
     * @notice Add to reserve
     * @param amount Amount to add
     */
    function addToReserve(uint256 amount) external;
    
    /**
     * @notice Subtract from reserve
     * @param amount Amount to subtract
     */
    function subtractFromReserve(uint256 amount) external;

    // ============ View Functions ============
    
    /**
     * @notice Get aggregated statistics
     * @return totalMembers Total member count
     * @return totalBenefits Total benefit count
     * @return totalAmount Total benefit amount
     */
    function getAggregatedStats() external view returns (
        uint256 totalMembers,
        uint256 totalBenefits,
        uint256 totalAmount
    );
    
    /**
     * @notice Get obfuscated reserves
     * @return reserve Current reserve amount
     * @return lastUpdate Last update timestamp
     */
    function getObfuscatedReserves() external view returns (
        uint256 reserve,
        uint256 lastUpdate
    );
    
    /**
     * @notice Get stats last updated timestamp
     * @return lastUpdated Last update timestamp
     */
    function getStatsLastUpdated() external view returns (uint256);
    
    /**
     * @notice Get reserve last updated timestamp
     * @return lastUpdate Last update timestamp
     */
    function getReserveLastUpdated() external view returns (uint256);
    
    /**
     * @notice Calculate reserve ratio
     * @return ratio Reserve ratio percentage
     */
    function calculateReserveRatio() external view returns (uint256);
}