import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES, CRYPTIC_BENEFIT_NETWORK_ABI, POLICY_MANAGER_ABI, BENEFIT_VAULT_ABI, AGGREGATOR_ABI } from '@/config/contracts';
import { sepolia } from 'wagmi/chains';

// Hook for reading contract data
export const useContractRead = (functionName: string, args: any[] = [], abi: any = CRYPTIC_BENEFIT_NETWORK_ABI) => {
  const { chain } = useAccount();
  const chainId = chain?.id || sepolia.id;
  
  return useReadContract({
    address: CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.CipherCareNetworkV2 as `0x${string}`,
    abi,
    functionName,
    args,
    chainId,
  });
};

// Hook for writing to contract
export const useContractWrite = () => {
  const { chain } = useAccount();
  const chainId = chain?.id || sepolia.id;

  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const write = (functionName: string, args: any[], abi: any = CRYPTIC_BENEFIT_NETWORK_ABI) => {
    writeContract({
      address: CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.CipherCareNetworkV2 as `0x${string}`,
      abi,
      functionName,
      args,
      chainId,
      gas: 500_000n, // Explicit gas limit for Sepolia
    });
  };

  return {
    write,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

// Specific hooks for different contract functions
export const useSystemStats = () => {
  // Mock data for now since we only have AccessControl deployed
  return {
    data: [0, 0, 0], // [totalMembers, totalBenefits, activePolicies]
    isLoading: false,
    error: null
  };
};

export const useMemberBenefitCount = (memberAddress: string) => {
  // Mock data for now
  return {
    data: 0,
    isLoading: false,
    error: null
  };
};

export const useMemberBenefitRecord = (memberAddress: string, index: number) => {
  // Mock data for now
  return {
    data: ['0x', 0, 0, 0], // [encryptedData, policyId, timestamp, status]
    isLoading: false,
    error: null
  };
};

export const useSubmitBenefit = () => {
  const { chain } = useAccount();
  const chainId = chain?.id || sepolia.id;
  
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const writeToBenefitVault = (functionName: string, args: any[]) => {
    writeContract({
      address: CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.BenefitVault as `0x${string}`,
      abi: BENEFIT_VAULT_ABI,
      functionName,
      args,
      chainId,
      gas: 500_000n, // Explicit gas limit for Sepolia
    });
  };

  // For encrypted submission (FHE)
  const submitEncryptedBenefit = (policyId: number, encryptedData: any) => {
    console.log('🔐 Submitting encrypted benefit with FHE...', encryptedData);
    
    // Create a proper FHE-encrypted benefit record
    // The encrypted data contains: amountHandle, policyIdHandle, benefitTypeHandle, signature
    const fheRecord = {
      amountHandle: encryptedData.amountHandle,
      policyIdHandle: encryptedData.policyIdHandle,
      benefitTypeHandle: encryptedData.benefitTypeHandle,
      signature: encryptedData.signature,
      timestamp: Date.now()
    };
    
    // Encode the FHE data for storage
    const encodedFheData = JSON.stringify(fheRecord);
    
    // Submit to BenefitVault with FHE-encrypted data
    writeToBenefitVault('recordBenefit', [policyId, 0, 'fhe-encrypted', encodedFheData]);
  };

  // For benefit submission to SimpleBenefitVault
  const submitPlainBenefit = (policyId: number, amount: number, benefitType: string, description: string) => {
    writeToBenefitVault('recordBenefit', [policyId, amount, benefitType, description]);
  };

  return {
    submitEncryptedBenefit,
    submitPlainBenefit,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

export const useRequestAssessment = () => {
  const { write, ...rest } = useContractWrite();
  
  const requestAssessment = (member: string, policyId: number) => {
    write('requestBenefitAssessment', [member, policyId]);
  };

  return {
    requestAssessment,
    ...rest,
  };
};

// Policy Manager hooks
export const useActivePolicies = () => {
  return usePolicyManagerRead('getActivePolicies', []);
};

// Benefit Vault hooks
export const useVaultBenefitCount = (memberAddress: string) => {
  return useContractRead('getMemberBenefitCount', [memberAddress], BENEFIT_VAULT_ABI);
};

export const useVaultBenefitRecord = (memberAddress: string, index: number) => {
  return useContractRead('getBenefitRecord', [memberAddress, index], BENEFIT_VAULT_ABI);
};

// Aggregator hooks
export const useAggregatedStats = () => {
  return useContractRead('getAggregatedStats', [], AGGREGATOR_ABI);
};

export const useObfuscatedReserves = () => {
  return useContractRead('getObfuscatedReserves', [], AGGREGATOR_ABI);
};

// AccessControl specific hooks
export const useHasRole = (role: string, account: string) => {
  return useContractRead('hasRole', [role, account]);
};

export const useRoleMemberCount = (role: string) => {
  return useContractRead('getRoleMemberCount', [role]);
};

export const useRoleMember = (role: string, index: number) => {
  return useContractRead('getRoleMember', [role, index]);
};

export const useGrantRole = () => {
  const { write, ...rest } = useContractWrite();
  
  const grantRole = (role: string, account: string) => {
    write('grantRole', [role, account]);
  };

  return {
    grantRole,
    ...rest,
  };
};

// ============ PolicyManager Hooks ============

// Hook for reading PolicyManager contract data
export const usePolicyManagerRead = (functionName: string, args: any[] = []) => {
  const { chain } = useAccount();
  const chainId = chain?.id || sepolia.id;
  
  return useReadContract({
    address: CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.PolicyManager as `0x${string}`,
    abi: POLICY_MANAGER_ABI,
    functionName,
    args,
    chainId,
  });
};

// Hook for writing to PolicyManager contract
export const usePolicyManagerWrite = () => {
  const { chain } = useAccount();
  const chainId = chain?.id || sepolia.id;

  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const write = (functionName: string, args: any[]) => {
    writeContract({
      address: CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.PolicyManager as `0x${string}`,
      abi: POLICY_MANAGER_ABI,
      functionName,
      args,
      chainId,
      gas: 500_000n, // Explicit gas limit for Sepolia
    });
  };

  return {
    write,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

// Hook for getting policy count
export const usePolicyCount = () => {
  return usePolicyManagerRead('nextPolicyId', []);
};

// Hook for getting policy details
export const usePolicyDetails = (policyId: number) => {
  return usePolicyManagerRead('getPolicyDetails', [policyId]);
};

// Hook for getting all policies list
export const usePolicyList = () => {
  return usePolicyManagerRead('listPolicies');
};

// Hook for checking if policy is active
export const useIsPolicyActive = (policyId: number) => {
  return usePolicyManagerRead('isPolicyActive', [policyId]);
};

// Hook for creating a policy
export const useCreatePolicy = () => {
  const { write, hash, error, isPending, isConfirming, isConfirmed } = usePolicyManagerWrite();
  
  const createPolicy = (name: string, description: string, maxAmount: number) => {
    write('createPolicy', [name, description, maxAmount]);
  };

  return {
    createPolicy,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

// Hook for activating a policy
export const useActivatePolicy = () => {
  const { write, hash, error, isPending, isConfirming, isConfirmed } = usePolicyManagerWrite();
  
  const activatePolicy = (policyId: number) => {
    write('activatePolicy', [policyId]);
  };

  return {
    activatePolicy,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
};
