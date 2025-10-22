import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'CipherCare',
  projectId: 'demo-project-id', // Temporary project ID for development
  chains: [sepolia],
  ssr: false,
});
