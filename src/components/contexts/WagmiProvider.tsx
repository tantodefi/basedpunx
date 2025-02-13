'use client';

import { WagmiConfig } from 'wagmi';
import { createClientUPProvider } from '@lukso/up-provider';
import { getConfig } from '@/config/wagmi';
import { useEffect, useState } from 'react';

export default function WagmiProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const upProvider = createClientUPProvider();
  const config = getConfig(upProvider);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <WagmiConfig config={config}>{children}</WagmiConfig>;
} 