import { http, createConfig } from '@wagmi/core';
import { mainnet, sepolia } from '@wagmi/core/chains';
import type { Connector } from '@wagmi/core';

// Using a demo project ID - replace with your own WalletConnect project ID
const projectId = 'c0a9e1d7b8a2f3e4d5c6b7a8e9f0a1b2';

// Lazy connector factory functions (only injected for now)
const createConnectors = {
  async injected() {
    const { injected } = await import('@wagmi/connectors');
    return injected();
  },
  // Commented out heavy connectors - using EIP-6963 detection instead
  // async metaMask() {
  //   const { metaMask } = await import('@wagmi/connectors');
  //   return metaMask();
  // },
  // async coinbaseWallet() {
  //   const { coinbaseWallet } = await import('@wagmi/connectors');
  //   return coinbaseWallet({
  //     appName: 'SafeSign',
  //   });
  // },
  // async walletConnect() {
  //   const { walletConnect } = await import('@wagmi/connectors');
  //   return walletConnect({
  //     projectId,
  //     metadata: {
  //       name: 'SafeSign',
  //       description: 'Plateforme de génération de documents locatifs',
  //       url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  //       icons: ['/logo.svg'],
  //     },
  //   });
  // },
};

// Start with minimal config
export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// EIP-6963 wallet detection types
export interface EIP6963ProviderInfo {
  rdns: string;
  uuid: string;
  name: string;
  icon: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: any; // EIP-1193 provider
}

// Global variable to store discovered wallets
const discoveredWallets = new Map<string, EIP6963ProviderDetail>();

// EIP-6963 wallet discovery
export function initializeWalletDiscovery() {
  if (typeof window === 'undefined') return;

  // Listen for wallet announcements
  window.addEventListener('eip6963:announceProvider', (event: any) => {
    const { info, provider } = event.detail;
    console.log('Wallet announced:', info.name, info);
    discoveredWallets.set(info.rdns, { info, provider });
  });

  // Request wallets to announce themselves
  window.dispatchEvent(new CustomEvent('eip6963:requestProvider'));

  // Fallback: detect legacy window.ethereum wallets
  setTimeout(() => {
    detectLegacyWallets();
  }, 100);
}

// Legacy wallet detection fallback
function detectLegacyWallets() {
  if (typeof window === 'undefined') return;
  
  const { ethereum } = window as any;
  if (!ethereum) return;

  const providers = Array.isArray(ethereum.providers) ? ethereum.providers : [ethereum];
  
  providers.forEach((provider: any, index: number) => {
    const name = identifyLegacyProvider(provider);
    const rdns = `legacy.${name.toLowerCase().replace(/\s+/g, '.')}.${index}`;
    
    // Only add if not already discovered via EIP-6963
    if (!Array.from(discoveredWallets.values()).some(w => w.info.name === name)) {
      discoveredWallets.set(rdns, {
        info: {
          name,
          rdns,
          icon: '', // No icon for legacy detection
          uuid: `legacy-${index}`
        },
        provider
      });
    }
  });
}

function identifyLegacyProvider(provider: any): string {
  if (!provider) return 'Unknown Wallet';
  if (provider.isMetaMask && !provider.isBraveWallet) return 'MetaMask';
  if (provider.isBraveWallet) return 'Brave Wallet';
  if (provider.isRabby) return 'Rabby';
  if (provider.isCoinbaseWallet) return 'Coinbase Wallet';
  if (provider.isPhantom) return 'Phantom';
  if (provider.isTrust) return 'Trust Wallet';
  if (provider.isTally) return 'Tally Ho';
  if (provider.isOkxWallet || provider.isOkx) return 'OKX Wallet';
  if (provider.isFrame) return 'Frame';
  if (provider.isTokenPocket) return 'TokenPocket';
  if (provider.isMathWallet) return 'MathWallet';
  if (provider.isBitKeep) return 'BitKeep';
  if (provider.isSafe) return 'Safe';
  return provider.name || 'Unknown Wallet';
}

// Get all discovered wallets
export function getDiscoveredWallets(): EIP6963ProviderDetail[] {
  return Array.from(discoveredWallets.values());
}

// Get specific wallet provider by rdns
export function getWalletProvider(rdns: string) {
  return discoveredWallets.get(rdns)?.provider;
}

// Cache for loaded connectors
const connectorCache = new Map<string, Connector>();

// Function to lazy load a connector
export async function loadConnector(id: keyof typeof createConnectors): Promise<Connector> {
  if (connectorCache.has(id)) {
    return connectorCache.get(id)!;
  }
  
  const connector = await createConnectors[id]() as any;
  connectorCache.set(id, connector);
  
  // Add to config if not already present  
  if (!config.connectors.some((c: any) => c.id === connector.id)) {
    (config.connectors as any).push(connector);
  }
  
  return connector as Connector;
}

declare module '@wagmi/core' {
  interface Register {
    config: typeof config;
  }
}