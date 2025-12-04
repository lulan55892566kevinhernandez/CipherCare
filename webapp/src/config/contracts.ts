// Contract configuration for CipherCare
import { sepolia } from 'wagmi/chains';

// Main contract addresses
export const CONTRACT_ADDRESSES = {
  [sepolia.id]: {
    AccessControl: '0x428a7a4c836bEdb3BFAC9c45Aa722Af54e6959eB',
    PolicyManager: '0x84a8AECd30Afab760D5Bccd2d5420c55601b1708', // SimplePolicyManager
    BenefitVault: '0xC054f4fb4d8366010615d564175A52F3f16749C6', // SimpleBenefitVault
    CipherCareNetworkV2: '0x36128b901DdE49A2FB5DF433119a4490811E7E57', // CrypticBenefitNetworkV2 with fhEVM 0.9.1
  }
} as const;

// AccessControl ABI for the deployed contract
export const CRYPTIC_BENEFIT_NETWORK_ABI = [
  // Role constants
  {
    inputs: [],
    name: 'GOVERNOR_ROLE',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'COUNCIL_ROLE',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'ASSESSOR_ROLE',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'AUDITOR_ROLE',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'MEMBER_ROLE',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  // Role management functions
  {
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' }
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' }
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' }
    ],
    name: 'hasRole',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'role', type: 'bytes32' }
    ],
    name: 'getRoleMemberCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'index', type: 'uint256' }
    ],
    name: 'getRoleMember',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'role', type: 'bytes32' },
      { indexed: true, name: 'account', type: 'address' },
      { indexed: true, name: 'sender', type: 'address' }
    ],
    name: 'RoleGranted',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'role', type: 'bytes32' },
      { indexed: true, name: 'account', type: 'address' },
      { indexed: true, name: 'sender', type: 'address' }
    ],
    name: 'RoleRevoked',
    type: 'event'
  }
] as const;

// V2 Contract ABI
export const V2_CONTRACT_ABI = [
  {
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'maxAmount', type: 'uint64' }
    ],
    name: 'createPolicy',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'policyId', type: 'uint256' }
    ],
    name: 'getPolicyDetails',
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'isActive', type: 'bool' },
      { name: 'creator', type: 'address' },
      { name: 'createdAt', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'listPolicies',
    outputs: [
      { name: 'ids', type: 'uint256[]' },
      { name: 'names', type: 'string[]' },
      { name: 'statuses', type: 'bool[]' },
      { name: 'creators', type: 'address[]' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'policyId', type: 'uint256' },
      { name: 'amount', type: 'uint64' }
    ],
    name: 'recordPlainBenefit',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'policyId', type: 'uint256' },
      { name: 'encryptedAmount', type: 'bytes' },
      { name: 'inputProof', type: 'bytes' }
    ],
    name: 'recordEncryptedBenefit',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'nextPolicyId',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Policy Manager ABI (SimplePolicyManager)
export const POLICY_MANAGER_ABI = [
  {
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'maxAmount', type: 'uint256' }
    ],
    name: 'createPolicy',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'policyId', type: 'uint256' }
    ],
    name: 'getPolicyDetails',
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'isActive', type: 'bool' },
      { name: 'maxAmount', type: 'uint256' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'priority', type: 'uint8' },
      { name: 'creator', type: 'address' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getActivePolicies',
    outputs: [
      {
        components: [
          { name: 'name', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'isActive', type: 'bool' },
          { name: 'maxAmount', type: 'uint256' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'priority', type: 'uint8' },
          { name: 'creator', type: 'address' }
        ],
        name: 'policies',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'nextPolicyId',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Benefit Vault ABI (SimpleBenefitVault)
export const BENEFIT_VAULT_ABI = [
  {
    inputs: [
      { name: 'policyId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'benefitType', type: 'string' },
      { name: 'description', type: 'string' }
    ],
    name: 'recordBenefit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'member', type: 'address' }
    ],
    name: 'getMemberBenefitCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'member', type: 'address' },
      { name: 'index', type: 'uint256' }
    ],
    name: 'getBenefitRecord',
    outputs: [
      { name: 'policyId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'status', type: 'uint8' },
      { name: 'benefitType', type: 'string' },
      { name: 'description', type: 'string' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'member', type: 'address' }
    ],
    name: 'getAllMemberBenefits',
    outputs: [
      {
        components: [
          { name: 'policyId', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'benefitType', type: 'string' },
          { name: 'description', type: 'string' }
        ],
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalBenefits',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Aggregator ABI
export const AGGREGATOR_ABI = [
  {
    inputs: [],
    name: 'getAggregatedStats',
    outputs: [
      { name: 'totalMembers', type: 'uint256' },
      { name: 'totalBenefits', type: 'uint256' },
      { name: 'totalAmount', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getObfuscatedReserves',
    outputs: [{ name: 'encryptedReserves', type: 'bytes' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;
