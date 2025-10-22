// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import {IAssessmentEngine} from "../interfaces/IAssessmentEngine.sol";
import {IAccessControl} from "../interfaces/IAccessControl.sol";

/**
 * @title AssessmentEngine
 * @dev FHE-encrypted assessment engine contract - handles encrypted benefit assessment calculations
 * @notice Implements FHE encryption for privacy-preserving benefit assessments
 */
contract AssessmentEngine is IAssessmentEngine {
    
    // ============ State Variables ============
    
    IAccessControl public accessControl;
    
    struct EncryptedAssessmentRequest {
        address member;                    // Member address (not encrypted for access control)
        uint256 policyId;                 // Policy ID (not encrypted for routing)
        bytes32 requestId;                 // Request ID (not encrypted for tracking)
        euint32 encryptedTimestamp;       // Encrypted timestamp
        uint8 status;                     // Plain status (0: Pending, 1: Processing, 2: Completed, 3: Failed)
        euint64 encryptedScore;           // Encrypted assessment score
        euint32 encryptedProcessingTime;   // Encrypted processing time
        bytes encryptedResult;            // Encrypted assessment result
    }
    
    mapping(bytes32 => EncryptedAssessmentRequest) public encryptedAssessmentRequests;
    mapping(address => bytes32[]) public memberAssessments;
    uint256 public totalAssessments;
    
    // ============ Modifiers ============
    
    modifier onlyAuthorized() {
        require(
            accessControl.hasRole(accessControl.ASSESSOR_ROLE(), msg.sender) ||
            accessControl.hasRole(accessControl.GOVERNOR_ROLE(), msg.sender),
            "Not authorized"
        );
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _accessControl) {
        accessControl = IAccessControl(_accessControl);
    }
    
    // ============ Core Functions ============
    
    function requestAssessment(
        address member,
        uint256 policyId,
        bytes32 requestId
    ) external onlyAuthorized {
        require(member != address(0), "Invalid member address");
        require(encryptedAssessmentRequests[requestId].member == address(0), "Request already exists");
        
        EncryptedAssessmentRequest memory newRequest = EncryptedAssessmentRequest({
            member: member,
            policyId: policyId,
            requestId: requestId,
            encryptedTimestamp: TFHE.asEuint32(block.timestamp),
            status: 0, // Pending
            encryptedScore: TFHE.asEuint64(0), // Initial score
            encryptedProcessingTime: TFHE.asEuint32(0), // Initial processing time
            encryptedResult: ""
        });
        
        encryptedAssessmentRequests[requestId] = newRequest;
        memberAssessments[member].push(requestId);
        totalAssessments++;
        
        emit AssessmentRequested(member, requestId, policyId, block.timestamp);
    }
    
    function processAssessment(
        bytes32 requestId,
        bytes calldata encryptedResult
    ) external onlyAuthorized {
        require(encryptedAssessmentRequests[requestId].member != address(0), "Request not found");
        require(encryptedAssessmentRequests[requestId].status == 0, "Request already processed");
        
        // Update status to processing
        encryptedAssessmentRequests[requestId].status = 1;
        encryptedAssessmentRequests[requestId].encryptedResult = encryptedResult;
        
        emit AssessmentProcessed(requestId, encryptedResult, block.timestamp);
    }
    
    function completeAssessment(
        bytes32 requestId,
        bytes calldata finalEncryptedResult
    ) external onlyAuthorized {
        require(encryptedAssessmentRequests[requestId].member != address(0), "Request not found");
        require(encryptedAssessmentRequests[requestId].status == 1, "Request not in processing state");
        
        // Update status to completed
        encryptedAssessmentRequests[requestId].status = 2;
        encryptedAssessmentRequests[requestId].encryptedResult = finalEncryptedResult;
        
        emit AssessmentCompleted(requestId, finalEncryptedResult, block.timestamp);
    }
    
    function failAssessment(
        bytes32 requestId,
        string calldata reason
    ) external onlyAuthorized {
        require(encryptedAssessmentRequests[requestId].member != address(0), "Request not found");
        require(encryptedAssessmentRequests[requestId].status == 0 ||
                encryptedAssessmentRequests[requestId].status == 1, "Request already completed");
        
        // Update status to failed
        encryptedAssessmentRequests[requestId].status = 3;
        
        emit AssessmentFailed(requestId, reason, block.timestamp);
    }
    
    // ============ FHE Assessment Functions ============
    
    function calculateEncryptedScore(
        bytes32 requestId,
        bytes calldata encryptedInputs
    ) external onlyAuthorized {
        require(encryptedAssessmentRequests[requestId].member != address(0), "Request not found");
        
        // Decode encrypted inputs (e.g., encrypted salary, tenure, performance metrics)
        // For actual FHE usage, encrypted inputs should be decoded properly
        euint64 encryptedSalary = TFHE.asEuint64(0); // Placeholder
        euint32 encryptedTenure = TFHE.asEuint32(0); // Placeholder
        euint8 encryptedPerformance = TFHE.asEuint8(0); // Placeholder
        
        // Perform encrypted calculations
        // This is a simplified example - in reality, you would have complex FHE operations
        euint64 score = TFHE.add(encryptedSalary, TFHE.asEuint64(1000)); // Example calculation
        
        encryptedAssessmentRequests[requestId].encryptedScore = score;
    }
    
    function compareEncryptedScores(
        bytes32 requestId1,
        bytes32 requestId2
    ) external view returns (bool) {
        require(encryptedAssessmentRequests[requestId1].member != address(0), "Request 1 not found");
        require(encryptedAssessmentRequests[requestId2].member != address(0), "Request 2 not found");
        
        euint64 score1 = encryptedAssessmentRequests[requestId1].encryptedScore;
        euint64 score2 = encryptedAssessmentRequests[requestId2].encryptedScore;
        
        // Compare encrypted scores using FHE
        // This would return an encrypted boolean result
        return true; // Placeholder
    }
    
    function aggregateEncryptedScores(
        bytes32[] calldata requestIds
    ) external returns (bytes memory) {
        require(requestIds.length > 0, "No requests provided");
        
        // Start with the first score
        euint64 aggregatedScore = encryptedAssessmentRequests[requestIds[0]].encryptedScore;
        
        // Add all other scores
        for (uint256 i = 1; i < requestIds.length; i++) {
            require(encryptedAssessmentRequests[requestIds[i]].member != address(0), "Request not found");
            aggregatedScore = TFHE.add(aggregatedScore, encryptedAssessmentRequests[requestIds[i]].encryptedScore);
        }
        
        return abi.encode(aggregatedScore);
    }
    
    // ============ View Functions ============
    
    function getAssessmentRequest(bytes32 requestId) external view returns (
        address member,
        uint256 policyId,
        uint256 timestamp,
        uint8 status,
        bytes memory result
    ) {
        require(encryptedAssessmentRequests[requestId].member != address(0), "Request not found");
        
        EncryptedAssessmentRequest memory request = encryptedAssessmentRequests[requestId];
        return (request.member, request.policyId, 0, 0, request.encryptedResult); // Encrypted values return 0
    }
    
    function getMemberAssessments(address member) external view returns (
        bytes32[] memory requestIds,
        uint256[] memory policyIds,
        uint256[] memory timestamps,
        uint8[] memory statuses
    ) {
        bytes32[] memory memberRequestIds = memberAssessments[member];
        uint256 count = memberRequestIds.length;
        
        requestIds = new bytes32[](count);
        policyIds = new uint256[](count);
        timestamps = new uint256[](count);
        statuses = new uint8[](count);
        
        for (uint256 i = 0; i < count; i++) {
            bytes32 requestId = memberRequestIds[i];
            EncryptedAssessmentRequest memory request = encryptedAssessmentRequests[requestId];
            
            requestIds[i] = requestId;
            policyIds[i] = request.policyId;
            timestamps[i] = 0; // Encrypted timestamp
            statuses[i] = 0; // Encrypted status
        }
        
        return (requestIds, policyIds, timestamps, statuses);
    }
    
    function getTotalAssessments() external view returns (uint256) {
        return totalAssessments;
    }
    
    function isAssessmentPending(bytes32 requestId) external view returns (bool) {
        return encryptedAssessmentRequests[requestId].status == 0;
    }
    
    function isAssessmentCompleted(bytes32 requestId) external view returns (bool) {
        return encryptedAssessmentRequests[requestId].status == 2;
    }
    
    function getEncryptedScore(bytes32 requestId) external view returns (bytes memory) {
        require(encryptedAssessmentRequests[requestId].member != address(0), "Request not found");
        return abi.encode(encryptedAssessmentRequests[requestId].encryptedScore);
    }
    
    function getEncryptedResult(bytes32 requestId) external view returns (bytes memory) {
        require(encryptedAssessmentRequests[requestId].member != address(0), "Request not found");
        return encryptedAssessmentRequests[requestId].encryptedResult;
    }
}