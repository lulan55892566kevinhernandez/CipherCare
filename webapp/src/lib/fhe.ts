import { bytesToHex, getAddress } from "viem";
import type { Address } from "viem";

declare global {
    interface Window {
        RelayerSDK?: any;
        relayerSDK?: any;
        ethereum?: any;
        okxwallet?: any;
    }
}

let fheInstance: any = null;

/**
 * Get the Relayer SDK from window object (loaded via CDN)
 */
const getSDK = () => {
    if (typeof window === "undefined") {
        throw new Error("FHE SDK requires a browser environment");
    }
    const sdk = window.RelayerSDK || window.relayerSDK;
    if (!sdk) {
        throw new Error("Relayer SDK not loaded. Ensure the CDN script tag is present.");
    }
    return sdk;
};

/**
 * Initialize FHE instance for encryption/decryption operations
 * Updated for fhEVM 0.9.1 - Uses CDN loaded RelayerSDK
 */
export const initializeFHE = async (provider?: any): Promise<any> => {
    if (fheInstance) return fheInstance;
    if (typeof window === "undefined") {
        throw new Error("FHE SDK requires a browser environment");
    }

    const ethereumProvider =
        provider || window.ethereum || window.okxwallet?.provider || window.okxwallet;
    if (!ethereumProvider) {
        throw new Error("No wallet provider detected. Connect a wallet first.");
    }

    const sdk = getSDK();
    const { initSDK, createInstance, SepoliaConfig } = sdk;
    await initSDK();
    const config = { ...SepoliaConfig, network: ethereumProvider };
    fheInstance = await createInstance(config);
    console.log('[FHE] Instance initialized successfully');
    return fheInstance;
};

/**
 * Get current FHE instance, initializing if needed
 */
const getInstance = async (provider?: any) => {
    if (fheInstance) return fheInstance;
    return initializeFHE(provider);
};

/**
 * Get the current FHE instance (synchronous)
 */
export const getFHEInstance = (): any => {
    return fheInstance;
};

/**
 * Check if FHE SDK is loaded and ready
 */
export const isFHEReady = (): boolean => {
    if (typeof window === "undefined") return false;
    return !!(window.RelayerSDK || window.relayerSDK);
};

/**
 * Check if FHE instance is initialized
 */
export const isFheReady = (): boolean => {
    return fheInstance !== null;
};

export const isSDKLoaded = isFHEReady;

/**
 * Wait for FHE SDK to be loaded (with timeout)
 */
export const waitForFHE = async (timeoutMs: number = 10000): Promise<boolean> => {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
        if (isFHEReady()) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return false;
};

/**
 * Get FHE status for debugging
 */
export const getFHEStatus = (): {
    sdkLoaded: boolean;
    instanceReady: boolean;
} => {
    return {
        sdkLoaded: isFHEReady(),
        instanceReady: fheInstance !== null,
    };
};

/**
 * Encrypt a single uint32 value
 */
export const encryptUint32 = async (
    value: number,
    contractAddress: string,
    userAddress: string,
    provider?: any
): Promise<{ handle: `0x${string}`; proof: `0x${string}` }> => {
    console.log('[FHE] Encrypting uint32:', value);
    const instance = await getInstance(provider);
    const contractAddr = getAddress(contractAddress);
    const userAddr = getAddress(userAddress);

    const input = instance.createEncryptedInput(contractAddr, userAddr);
    input.add32(value);

    console.log('[FHE] Encrypting input...');
    const { handles, inputProof } = await input.encrypt();
    console.log('[FHE] Encryption complete, handles:', handles.length);

    if (handles.length < 1) {
        throw new Error('FHE SDK returned insufficient handles');
    }

    return {
        handle: bytesToHex(handles[0]) as `0x${string}`,
        proof: bytesToHex(inputProof) as `0x${string}`,
    };
};

/**
 * Encrypt a single uint64 value
 */
export const encryptUint64 = async (
    value: number | bigint,
    contractAddress: string,
    userAddress: string,
    provider?: any
): Promise<{ handle: `0x${string}`; proof: `0x${string}` }> => {
    console.log('[FHE] Encrypting uint64:', value);
    const instance = await getInstance(provider);
    const contractAddr = getAddress(contractAddress);
    const userAddr = getAddress(userAddress);

    const input = instance.createEncryptedInput(contractAddr, userAddr);
    input.add64(typeof value === 'bigint' ? value : BigInt(value));

    console.log('[FHE] Encrypting input...');
    const { handles, inputProof } = await input.encrypt();
    console.log('[FHE] Encryption complete, handles:', handles.length);

    if (handles.length < 1) {
        throw new Error('FHE SDK returned insufficient handles');
    }

    return {
        handle: bytesToHex(handles[0]) as `0x${string}`,
        proof: bytesToHex(inputProof) as `0x${string}`,
    };
};

/**
 * Encrypt a single uint8 value
 */
export const encryptUint8 = async (
    value: number,
    contractAddress: string,
    userAddress: string,
    provider?: any
): Promise<{ handle: `0x${string}`; proof: `0x${string}` }> => {
    console.log('[FHE] Encrypting uint8:', value);
    const instance = await getInstance(provider);
    const contractAddr = getAddress(contractAddress);
    const userAddr = getAddress(userAddress);

    const input = instance.createEncryptedInput(contractAddr, userAddr);
    input.add8(value);

    console.log('[FHE] Encrypting input...');
    const { handles, inputProof } = await input.encrypt();
    console.log('[FHE] Encryption complete, handles:', handles.length);

    if (handles.length < 1) {
        throw new Error('FHE SDK returned insufficient handles');
    }

    return {
        handle: bytesToHex(handles[0]) as `0x${string}`,
        proof: bytesToHex(inputProof) as `0x${string}`,
    };
};

/**
 * Encrypt benefit data (amount, policy ID, and additional metadata)
 */
export const encryptBenefitData = async (
    amount: number | bigint,
    policyId: number,
    benefitType: number,
    contractAddress: string,
    userAddress: string,
    provider?: any
): Promise<{
    amountHandle: `0x${string}`;
    policyIdHandle: `0x${string}`;
    benefitTypeHandle: `0x${string}`;
    proof: `0x${string}`;
}> => {
    console.log('[FHE] Encrypting benefit data:', { amount, policyId, benefitType });
    const instance = await getInstance(provider);
    const contractAddr = getAddress(contractAddress);
    const userAddr = getAddress(userAddress);

    const input = instance.createEncryptedInput(contractAddr, userAddr);

    // Add all values in order
    input.add64(typeof amount === 'bigint' ? amount : BigInt(amount));  // euint64 for amount
    input.add32(policyId);         // euint32 for policy ID
    input.add8(benefitType);       // euint8 for benefit type

    console.log('[FHE] Encrypting input...');
    const { handles, inputProof } = await input.encrypt();
    console.log('[FHE] Encryption complete, handles:', handles.length);

    if (handles.length < 3) {
        throw new Error('FHE SDK returned insufficient handles');
    }

    return {
        amountHandle: bytesToHex(handles[0]) as `0x${string}`,
        policyIdHandle: bytesToHex(handles[1]) as `0x${string}`,
        benefitTypeHandle: bytesToHex(handles[2]) as `0x${string}`,
        proof: bytesToHex(inputProof) as `0x${string}`,
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
    userAddress: string,
    provider?: any
): Promise<{
    amountHandle: `0x${string}`;
    policyIdHandle: `0x${string}`;
    benefitTypeHandle: `0x${string}`;
    proof: `0x${string}`;
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
        userAddress,
        provider
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
        console.error('[FHE] Reencryption failed:', error);
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

// Legacy exports for backward compatibility
export { encryptUint32 as encryptAmount };
export { encryptUint64 as encryptPolicyAmount };
