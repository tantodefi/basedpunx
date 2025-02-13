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
export const config = createConfig({
  chains: [lukso],
  multiInjectedProviderDiscovery: true,
  connectors: [
    injected(),
  ],
  ssr: true,
  transports: {
    [lukso.id]: http(),
  },
});

// Keep getConfig for cases where UP provider is needed
export const getConfig = (upProvider: any) => createConfig({
  chains: [lukso],
  multiInjectedProviderDiscovery: true,
  connectors: [
    injected({
      target: {
        id: 'up-provider',
        name: 'Universal Profile',
        provider: upProvider
      },
    }),
    injected(),
  ],
  ssr: true,
  transports: {
    [lukso.id]: http(),
  },
});
