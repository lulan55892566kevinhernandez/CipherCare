// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IAccessControl} from "./interfaces/IAccessControl.sol";
import {IBenefitVault} from "./interfaces/IBenefitVault.sol";
import {IPolicyManager} from "./interfaces/IPolicyManager.sol";
import {IAssessmentEngine} from "./interfaces/IAssessmentEngine.sol";
import {IAggregator} from "./interfaces/IAggregator.sol";
import {AccessControl} from "./core/AccessControl.sol";
import {BenefitVault} from "./core/BenefitVault.sol";
import {PolicyManager} from "./core/PolicyManager.sol";
import {AssessmentEngine} from "./core/AssessmentEngine.sol";
import {Aggregator} from "./core/Aggregator.sol";

/**
 * @title CrypticBenefitNetworkSimple
 * @dev Simplified version without FHE dependencies for initial deployment
 * @notice Privacy-preserving benefit distribution platform main contract
 */
contract CrypticBenefitNetworkSimple {
    
    // ============ State Variables ============
    
    IAccessControl public accessControl;
    IBenefitVault public benefitVault;
    IPolicyManager public policyManager;
    IAssessmentEngine public assessmentEngine;
    IAggregator public aggregator;
    
    address public owner;
    uint256 public totalMembers;
    uint256 public totalBenefits;
    uint256 public activePolicies;
    
    // ============ Events ============
    
    event BenefitRecordSubmitted(address indexed member, uint256 indexed policyId, bytes encryptedData);
    event AssessmentRequested(address indexed member, bytes32 indexed requestId, uint256 indexed policyId);
    event SystemInitialized(address accessControl, address benefitVault, address policyManager, address assessmentEngine, address aggregator);
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorized() {
        require(accessControl.hasRole(accessControl.ASSESSOR_ROLE(), msg.sender) || msg.sender == owner, "Not authorized");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() {
        owner = msg.sender;
    }
    
    // ============ Initialization ============
    
    function initializeSystem(
        address _accessControl,
        address _benefitVault,
        address _policyManager,
        address _assessmentEngine,
        address _aggregator
    ) external onlyOwner {
        require(_accessControl != address(0), "Invalid access control address");
        require(_benefitVault != address(0), "Invalid benefit vault address");
        require(_policyManager != address(0), "Invalid policy manager address");
        require(_assessmentEngine != address(0), "Invalid assessment engine address");
        require(_aggregator != address(0), "Invalid aggregator address");
        
        accessControl = IAccessControl(_accessControl);
        benefitVault = IBenefitVault(_benefitVault);
        policyManager = IPolicyManager(_policyManager);
        assessmentEngine = IAssessmentEngine(_assessmentEngine);
        aggregator = IAggregator(_aggregator);
        
        emit SystemInitialized(_accessControl, _benefitVault, _policyManager, _assessmentEngine, _aggregator);
    }
    
    // ============ Core Functions ============
    
    function submitBenefitRecord(
        address member,
        bytes calldata encryptedData,
        uint256 policyId
    ) external onlyAuthorized {
        require(member != address(0), "Invalid member address");
        require(encryptedData.length > 0, "Encrypted data cannot be empty");
        require(policyManager.isPolicyActive(policyId), "Policy not active");
        
        // Submit to benefit vault
        benefitVault.storeBenefitRecord(member, encryptedData, policyId);
        
        // Update statistics
        totalBenefits++;
        
        emit BenefitRecordSubmitted(member, policyId, encryptedData);
    }
    
    function requestBenefitAssessment(
        address member,
        uint256 policyId
    ) external onlyAuthorized returns (bytes32) {
        require(member != address(0), "Invalid member address");
        require(policyManager.isPolicyActive(policyId), "Policy not active");
        
        // Generate request ID
        bytes32 requestId = keccak256(abi.encodePacked(member, policyId, block.timestamp, block.number));
        
        // Request assessment
        assessmentEngine.requestAssessment(member, policyId, requestId);
        
        emit AssessmentRequested(member, requestId, policyId);
        
        return requestId;
    }
    
    // ============ View Functions ============
    
    function getMemberBenefitCount(address member) external view returns (uint256) {
        return benefitVault.getMemberBenefitCount(member);
    }
    
    function getMemberBenefitRecord(address member, uint256 index) external view returns (
        bytes memory encryptedData,
        uint256 policyId,
        uint256 timestamp,
        uint8 status
    ) {
        return benefitVault.getBenefitRecord(member, index);
    }
    
    function getSystemStats() external view returns (
        uint256 _totalMembers,
        uint256 _totalBenefits,
        uint256 _activePolicies
    ) {
        return (totalMembers, totalBenefits, activePolicies);
    }
    
    function getActivePolicies() external view returns (
        uint256[] memory policyIds,
        string[] memory names,
        string[] memory descriptions,
        bool[] memory isActive,
        uint256[] memory maxAmounts
    ) {
        return policyManager.getActivePolicies();
    }
    
    function getPolicyDetails(uint256 policyId) external view returns (
        string memory name,
        string memory description,
        bool isActive,
        uint256 maxAmount
    ) {
        return policyManager.getPolicyDetails(policyId);
    }
    
    function getAggregatedStats() external view returns (
        uint256 _totalMembers,
        uint256 _totalBenefits,
        uint256 _totalAmount
    ) {
        return aggregator.getAggregatedStats();
    }
    
    // ============ Admin Functions ============
    
    function updateTotalMembers(uint256 _totalMembers) external onlyOwner {
        totalMembers = _totalMembers;
    }
    
    function updateActivePolicies(uint256 _activePolicies) external onlyOwner {
        activePolicies = _activePolicies;
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
}



