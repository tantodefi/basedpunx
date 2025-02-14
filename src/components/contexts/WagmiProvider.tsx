'use client';

import { WagmiConfig } from 'wagmi';
import { createClientUPProvider } from '@lukso/up-provider';
import { getConfig } from '@/config/wagmi';
import { useEffect, useState } from 'react';

interface WagmiProviderProps {
  children: React.ReactNode;
}

const WagmiProvider = ({ children }: WagmiProviderProps) => {
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize UP provider
        const upProvider = createClientUPProvider();
        
        // Check if we're already connected
        const accounts = await upProvider.request({ method: 'eth_accounts' });
        const isConnected = accounts && accounts.length > 0;

        // Create config with auto-connect if we have accounts
        const wagmiConfig = getConfig(upProvider, isConnected);
        setConfig(wagmiConfig);
      } catch (error) {
        console.error('Error initializing WagmiProvider:', error);
      } finally {
        setMounted(true);
      }
    };

    init();
  }, []);

  if (!mounted) return null;
  if (!config) return null;

  return <WagmiConfig config={config}>{children}</WagmiConfig>;
};

export default WagmiProvider; 