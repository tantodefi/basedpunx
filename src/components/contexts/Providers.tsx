"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { UPProvider } from "./UPContext";
import WagmiProvider from "./WagmiProvider";
import { ErrorBoundary } from "../ErrorBoundary";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ErrorBoundary>
      <WagmiProvider>
        <QueryClientProvider client={queryClient}>
          <UPProvider>
            {children}
          </UPProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}
