"use client";

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { custom } from 'viem';
import { createWalletClient } from 'viem';
import { lukso } from 'wagmi/chains';
import { toast } from 'sonner';

interface UPContextType {
  walletConnected: boolean;
  accounts: string[];
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isUPProvider: boolean;
  provider: any;
}

const UPContext = createContext<UPContextType>({
  walletConnected: false,
  accounts: [],
  connect: async () => {},
  disconnect: async () => {},
  isUPProvider: false,
  provider: null,
});

export const useUP = () => useContext(UPContext);

export function UPProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [isUPProvider, setIsUPProvider] = useState(false);
  const [provider, setProvider] = useState<any>(null);

  const { connect: wagmiConnect, connectors } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  // Initialize and check UP provider
  useEffect(() => {
    const initProvider = async () => {
      if (typeof window === 'undefined') return;
      
      const ethereum = window.ethereum;
      if (!ethereum) return;

      try {
        const isUP = 'isUniversalProfileProvider' in ethereum;
        setIsUPProvider(isUP);
        
        if (isUP) {
          setProvider(ethereum);
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          if (accounts?.length) {
            setAccounts(accounts);
            setWalletConnected(true);
          }
        }
      } catch (error) {
        console.error('Error initializing UP provider:', error);
      }
    };

    initProvider();
  }, []);

  // Handle wagmi connection changes
  useEffect(() => {
    if (isConnected && address) {
      setAccounts([address]);
      setWalletConnected(true);
    } else {
      setAccounts([]);
      setWalletConnected(false);
    }
  }, [isConnected, address]);

  // Auto-connect if UP provider is available
  useEffect(() => {
    const autoConnect = async () => {
      if (!isUPProvider || !provider || isConnected) return;

      try {
        const upConnector = connectors.find(c => c.id === 'up-provider');
        if (upConnector) {
          await wagmiConnect({ connector: upConnector });
        }
      } catch (error) {
        console.error('Error auto-connecting:', error);
      }
    };

    autoConnect();
  }, [isUPProvider, provider, connectors, wagmiConnect, isConnected]);

  const connect = async () => {
    if (!isUPProvider) {
      toast('Please install UP Browser Extension');
      return;
    }

    try {
      const upConnector = connectors.find(c => c.id === 'up-provider');
      if (!upConnector) {
        throw new Error('UP Provider not found');
      }
      await wagmiConnect({ connector: upConnector });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setWalletConnected(false);
    }
  };

  const disconnect = async () => {
    try {
      await wagmiDisconnect();
      setWalletConnected(false);
      setAccounts([]);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const value = useMemo(() => ({
    walletConnected,
    accounts,
    connect,
    disconnect,
    isUPProvider,
    provider,
  }), [walletConnected, accounts, isUPProvider, provider]);

  return <UPContext.Provider value={value}>{children}</UPContext.Provider>;
} 