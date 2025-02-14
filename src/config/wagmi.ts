import { http, createConfig } from "wagmi";
import { lukso } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const IPFS_GATEWAYS = [
  'https://cloudflare-ipfs.com/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://gateway.ipfs.io/ipfs/'
];

// Create a default config without UP provider
// export const config = createConfig({...});

// Keep getConfig for cases where UP provider is needed
export const getConfig = (upProvider: any, autoConnect: boolean = false) => {
  // During SSR, return a basic config
  if (typeof window === 'undefined') {
    return createConfig({
      chains: [lukso],
      multiInjectedProviderDiscovery: false,
      connectors: [],
      ssr: true,
      transports: {
        [lukso.id]: http(),
      },
    });
  }

  // For client-side, configure with UP provider
  const upConnector = injected({
    target: {
      id: 'up-provider',
      name: 'Universal Profile',
      provider: upProvider,
    },
  });

  return createConfig({
    chains: [lukso],
    multiInjectedProviderDiscovery: false,
    connectors: [upConnector],
    autoConnect: true, // Always try to auto-connect
    ssr: true,
    transports: {
      [lukso.id]: http(),
    },
  });
};
