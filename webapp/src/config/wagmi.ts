import { http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Use a reliable RPC endpoint
const SEPOLIA_RPC = 'https://ethereum-sepolia-rpc.publicnode.com';

export const wagmiConfig = getDefaultConfig({
  appName: 'CipherCare',
  projectId: 'c4fc91a4c80b47d7bf5f754f5be7969b', // WalletConnect project ID
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(SEPOLIA_RPC, {
      batch: {
        wait: 100,
      },
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
  ssr: false,
});

export { sepolia };
export const SEPOLIA_RPC_URL = SEPOLIA_RPC;
