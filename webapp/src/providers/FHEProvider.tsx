import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeFHE } from '@/lib/fhe';
import { useAccount } from 'wagmi';

interface FHEContextType {
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
  reinitialize: () => Promise<void>;
}

const FHEContext = createContext<FHEContextType>({
  isInitialized: false,
  isInitializing: false,
  error: null,
  reinitialize: async () => {},
});

export const useFHE = () => {
  const context = useContext(FHEContext);
  if (!context) {
    throw new Error('useFHE must be used within FHEProvider');
  }
  return context;
};

interface FHEProviderProps {
  children: ReactNode;
}

export const FHEProvider = ({ children }: FHEProviderProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isConnected } = useAccount();

  const initialize = async () => {
    if (isInitialized || isInitializing) return;
    
    if (!isConnected) {
      console.log('⏸️  Waiting for wallet connection to initialize FHE');
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      console.log('🔧 Initializing FHE SDK...');
      const instance = await initializeFHE();
      
      if (instance) {
        setIsInitialized(true);
        console.log('✅ FHE SDK initialized successfully');
      } else {
        setError('FHE initialization returned null - encryption features disabled');
        console.warn('⚠️  FHE initialization returned null');
        // Still mark as "initialized" to prevent retries
        setIsInitialized(true);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('❌ FHE initialization failed:', errorMsg);
      setError(errorMsg);
      // Mark as initialized anyway to prevent infinite retries
      setIsInitialized(true);
    } finally {
      setIsInitializing(false);
    }
  };

  const reinitialize = async () => {
    setIsInitialized(false);
    await initialize();
  };

  useEffect(() => {
    if (isConnected && !isInitialized && !isInitializing) {
      initialize();
    }
  }, [isConnected]);

  return (
    <FHEContext.Provider
      value={{
        isInitialized,
        isInitializing,
        error,
        reinitialize,
      }}
    >
      {children}
    </FHEContext.Provider>
  );
};

