import { getAddress, hexlify } from 'ethers';

let fheInstance: any = null;

/**
 * Initialize FHE instance for encryption/decryption operations
 */
export const initializeFHE = async (): Promise<any> => {
  if (fheInstance) {
    return fheInstance;
  }

  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found');
  }

  try {
    const { createInstance, initSDK, SepoliaConfig } = await import('@zama-fhe/relayer-sdk/bundle');
    await initSDK();
    fheInstance = await createInstance(SepoliaConfig);
    console.log('FHE instance initialized successfully');
    return fheInstance;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('FHE initialization failed:', errorMsg);
    throw new Error(`FHE initialization failed: ${errorMsg}`);
  }
};

/**
 * Get the current FHE instance
 */
export const getFHEInstance = (): any => {
  return fheInstance;
};

/**
 * Encrypt a single uint32 value
 */
export const encryptUint32 = async (
  value: number,
  contractAddress: string,
  userAddress: string
): Promise<{ handle: string; signature: string }> => {
  let fhe = getFHEInstance();
  if (!fhe) {
    fhe = await initializeFHE();
  }
  if (!fhe) throw new Error('Failed to initialize FHE');

  const contractAddressChecksum = getAddress(contractAddress);
  const ciphertext = await fhe.createEncryptedInput(contractAddressChecksum, userAddress);
  ciphertext.add32(value);

  const { handles, inputProof } = await ciphertext.encrypt();

  const handle = hexlify(handles[0]);
  const proof = hexlify(inputProof);

  return { handle, signature: proof };
};

/**
 * Encrypt a single uint64 value
 */
export const encryptUint64 = async (
  value: number | bigint,
  contractAddress: string,
  userAddress: string
): Promise<{ handle: string; signature: string }> => {
  let fhe = getFHEInstance();
  if (!fhe) {
    fhe = await initializeFHE();
  }
  if (!fhe) throw new Error('Failed to initialize FHE');

  const contractAddressChecksum = getAddress(contractAddress);
  const ciphertext = await fhe.createEncryptedInput(contractAddressChecksum, userAddress);
  ciphertext.add64(typeof value === 'bigint' ? value : BigInt(value));

  const { handles, inputProof } = await ciphertext.encrypt();

  const handle = hexlify(handles[0]);
  const proof = hexlify(inputProof);

  return { handle, signature: proof };
};

/**
 * Encrypt a single uint8 value
 */
export const encryptUint8 = async (
  value: number,
  contractAddress: string,
  userAddress: string
): Promise<{ handle: string; signature: string }> => {
  let fhe = getFHEInstance();
  if (!fhe) {
    fhe = await initializeFHE();
  }
  if (!fhe) throw new Error('Failed to initialize FHE');

  const contractAddressChecksum = getAddress(contractAddress);
  const ciphertext = await fhe.createEncryptedInput(contractAddressChecksum, userAddress);
  ciphertext.add8(value);

  const { handles, inputProof } = await ciphertext.encrypt();

  const handle = hexlify(handles[0]);
  const proof = hexlify(inputProof);

  return { handle, signature: proof };
};

/**
 * Encrypt benefit data (amount, policy ID, and additional metadata)
 */
export const encryptBenefitData = async (
  amount: number | bigint,
  policyId: number,
  benefitType: number,
  contractAddress: string,
  userAddress: string
): Promise<{
  amountHandle: string;
  policyIdHandle: string;
  benefitTypeHandle: string;
  signature: string;
}> => {
  let fhe = getFHEInstance();
  if (!fhe) {
    fhe = await initializeFHE();
  }
  if (!fhe) throw new Error('Failed to initialize FHE');

  const contractAddressChecksum = getAddress(contractAddress);
  const ciphertext = await fhe.createEncryptedInput(contractAddressChecksum, userAddress);

  // Add all values in order
  ciphertext.add64(typeof amount === 'bigint' ? amount : BigInt(amount));  // euint64 for amount
  ciphertext.add32(policyId);         // euint32 for policy ID
  ciphertext.add8(benefitType);       // euint8 for benefit type

  const { handles, inputProof } = await ciphertext.encrypt();

  const amountHandle = hexlify(handles[0]);
  const policyIdHandle = hexlify(handles[1]);
  const benefitTypeHandle = hexlify(handles[2]);
  const signature = hexlify(inputProof);

  return {
    amountHandle,
    policyIdHandle,
    benefitTypeHandle,
    signature
  };
};

/**
 * Encrypt benefit data from form data object
 */
export const encryptBenefitDataFromForm = async (
  benefitData: {
    policyId: number;
    amount: number;
    benefitType: string;
    description: string;
    timestamp: number;
  },
  contractAddress: string,
  userAddress: string
): Promise<{
  amountHandle: string;
  policyIdHandle: string;
  benefitTypeHandle: string;
  signature: string;
}> => {
  // Convert benefit type string to number
  const benefitTypeMap: { [key: string]: number } = {
    'medical': 1,
    'education': 2,
    'housing': 3,
    'transportation': 4,
    'meal': 5,
    'other': 6,
    'general': 0
  };
  
  const benefitTypeNum = benefitTypeMap[benefitData.benefitType] || 0;
  
  return encryptBenefitData(
    benefitData.amount,
    benefitData.policyId,
    benefitTypeNum,
    contractAddress,
    userAddress
  );
};

/**
 * Request reencryption for viewing encrypted data
 */
export const requestReencryption = async (
  handle: string,
  publicKey: string,
  contractAddress: string
): Promise<bigint> => {
  const fhe = getFHEInstance();
  if (!fhe) throw new Error('FHE not initialized');

  try {
    const reencrypted = await fhe.reencrypt(
      handle,
      publicKey,
      contractAddress
    );
    return BigInt(reencrypted);
  } catch (error) {
    console.error('❌ Reencryption failed:', error);
    throw error;
  }
};

/**
 * Generate a deterministic hash from an address
 * This creates a privacy-preserving identifier
 */
export const hashAddress = (address: string): bigint => {
  const encoder = new TextEncoder();
  const data = encoder.encode(address.toLowerCase());

  let hash = 0n;
  const MAX_UINT64 = 0xFFFFFFFFFFFFFFFFn; // 2^64 - 1

  for (let i = 0; i < data.length; i++) {
    hash = ((hash * 31n) + BigInt(data[i])) % MAX_UINT64;
  }

  return hash;
};

