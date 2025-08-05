import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { metaMask, coinbaseWallet, walletConnect, injected } from 'wagmi/connectors';

// Using a demo project ID - replace with your own WalletConnect project ID
const projectId = 'c0a9e1d7b8a2f3e4d5c6b7a8e9f0a1b2';

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({
      appName: 'SafeSign',
    }),
    walletConnect({
      projectId,
      metadata: {
        name: 'SafeSign',
        description: 'Plateforme de génération de documents locatifs',
        url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
        icons: ['/logo.svg'],
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}