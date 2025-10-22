// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IAssessmentEngine
 * @dev Assessment engine interface - responsible for benefit assessment calculations
 * @notice Simplified version without FHE dependencies
 */
interface IAssessmentEngine {
    
    // ============ Event Definitions ============
    
    /// @notice Assessment requested event
    event AssessmentRequested(
        address indexed member,
        bytes32 indexed requestId,
        uint256 indexed policyId,
        uint256 timestamp
    );
    
    /// @notice Assessment processed event
    event AssessmentProcessed(
        bytes32 indexed requestId,
        bytes result,
        uint256 timestamp
    );
    
    /// @notice Assessment completed event
    event AssessmentCompleted(
        bytes32 indexed requestId,
        bytes finalResult,
        uint256 timestamp
    );
    
    /// @notice Assessment failed event
    event AssessmentFailed(
        bytes32 indexed requestId,
        string reason,
        uint256 timestamp
    );

    // ============ Error Definitions ============
    
    error AssessmentNotFound();
    error AssessmentAlreadyExists();
    error UnauthorizedAccess();
    error InvalidAssessmentData();
    error AssessmentNotPending();

    // ============ Core Functions ============
    
    /**
     * @notice Request benefit assessment
     * @param member Member address
     * @param policyId Policy ID
     * @param requestId Unique request ID
     */
    function requestAssessment(
        address member,
        uint256 policyId,
        bytes32 requestId
    ) external;
    
    /**
     * @notice Process assessment
     * @param requestId Request ID
     * @param result Assessment result
     */
    function processAssessment(
        bytes32 requestId,
        bytes calldata result
    ) external;
    
    /**
     * @notice Complete assessment
     * @param requestId Request ID
     * @param finalResult Final assessment result
     */
    function completeAssessment(
        bytes32 requestId,
        bytes calldata finalResult
    ) external;
    
    /**
     * @notice Fail assessment
     * @param requestId Request ID
     * @param reason Failure reason
     */
    function failAssessment(
        bytes32 requestId,
        string calldata reason
    ) external;

    // ============ View Functions ============
    
    /**
     * @notice Get assessment request
     * @param requestId Request ID
     * @return member Member address
     * @return policyId Policy ID
     * @return timestamp Request timestamp
     * @return status Assessment status
     * @return result Assessment result
     */
    function getAssessmentRequest(bytes32 requestId) external view returns (
        address member,
        uint256 policyId,
        uint256 timestamp,
        uint8 status,
        bytes memory result
    );
    
    /**
     * @notice Get member assessments
     * @param member Member address
     * @return requestIds Array of request IDs
     * @return policyIds Array of policy IDs
     * @return timestamps Array of timestamps
     * @return statuses Array of statuses
     */
    function getMemberAssessments(address member) external view returns (
        bytes32[] memory requestIds,
        uint256[] memory policyIds,
        uint256[] memory timestamps,
        uint8[] memory statuses
    );
    
    /**
     * @notice Get total assessments
     * @return totalAssessments Total assessment count
     */
    function getTotalAssessments() external view returns (uint256);
    
    /**
     * @notice Check if assessment is pending
     * @param requestId Request ID
     * @return isPending Whether assessment is pending
     */
    function isAssessmentPending(bytes32 requestId) external view returns (bool);
    
    /**
     * @notice Check if assessment is completed
     * @param requestId Request ID
     * @return isCompleted Whether assessment is completed
     */
    function isAssessmentCompleted(bytes32 requestId) external view returns (bool);
}