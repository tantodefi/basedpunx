"use client";

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { custom } from 'viem';
import { createWalletClient } from 'viem';
import { lukso } from 'wagmi/chains';

interface UPContextType {
  walletConnected: boolean;
  accounts: string[];
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isUPProvider: boolean;
}

const UPContext = createContext<UPContextType>({
  walletConnected: false,
  accounts: [],
  connect: async () => {},
  disconnect: async () => {},
  isUPProvider: false,
});

export const useUP = () => useContext(UPContext);

export function UPProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [isUPProvider, setIsUPProvider] = useState(false);

  const { connect: wagmiConnect, connectors } = useConnect();
  const { address, isConnected } = useAccount();

  const publicClient = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return window?.ethereum;
  }, []);

  useEffect(() => {
    // Check if UP Provider is available
    const checkUPProvider = async () => {
      if (publicClient) {
        try {
          const provider = await publicClient.request({ method: 'eth_requestAccounts' });
          // Check if it's UP Provider by checking specific properties or methods
          setIsUPProvider(!!provider && 'isUniversalProfileProvider' in publicClient);
        } catch (error) {
          console.error('Error checking UP Provider:', error);
          setIsUPProvider(false);
        }
      }
    };

    checkUPProvider();
  }, [publicClient]);

  const walletClient = useMemo(() => {
    if (!publicClient) return null;
    
    return createWalletClient({
      chain: lukso,
      transport: custom(publicClient),
    });
  }, [publicClient]);

  useEffect(() => {
    if (isConnected && address) {
      setAccounts([address]);
      setWalletConnected(true);
    } else {
      setAccounts([]);
      setWalletConnected(false);
    }
  }, [isConnected, address]);

  const connect = async () => {
    try {
      // Try to find UP Provider connector first
      const upConnector = connectors.find(c => c.id === 'up-provider');
      const connector = upConnector || connectors[0];
      
      if (!connector) {
        throw new Error('No connector found');
      }
      
      await wagmiConnect({ connector });
      setWalletConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setWalletConnected(false);
    }
  };

  const disconnect = async () => {
    try {
      setWalletConnected(false);
      setAccounts([]);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const value = {
    walletConnected,
    accounts,
    connect,
    disconnect,
    isUPProvider,
  };

  return <UPContext.Provider value={value}>{children}</UPContext.Provider>;
} 