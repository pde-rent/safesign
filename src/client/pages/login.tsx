import { useState, useEffect } from 'preact/hooks';
import { getAccount, signMessage, disconnect, connect, watchAccount, type Connector } from '@wagmi/core';
import { config, initializeWalletDiscovery, getDiscoveredWallets, type EIP6963ProviderDetail } from '../lib/wagmi.js';
import { useRouter } from '../lib/router.js';
import { api } from '../lib/api.js';
import { useStore } from '../lib/store.js';
import { Button, Card, CardContent, Alert } from '../components/ui.js';
import { authStore } from '../stores/auth.js';

const WALLET_ICONS: Record<string, string> = {
  'MetaMask': '/metamask.svg',
  'Coinbase Wallet': '/coinbase.svg',
  'WalletConnect': '/walletconnect.svg',
  'Rabby Wallet': '/rabby.svg',
  'Phantom': '/phantom.svg',
  'Rainbow': '/rainbow.svg',
  'Trust Wallet': '/trust.svg',
  'OKX Wallet': '/okx.svg',
  'Binance Web3 Wallet': '/binance.svg',
  'Ledger': '/ledger.svg',
  'Trezor': '/trezor.svg',
  'Safe': '/safe.svg',
  'Frame': '/frame.svg',
  'Zerion': '/zerion.svg',
  'Injected': '/wallet.svg',
};

export const LoginPage = () => {
  const { navigate } = useRouter();
  const setLoading = useStore(state => state.setLoading);
  const [globalError, setGlobalError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [discoveredWallets, setDiscoveredWallets] = useState<EIP6963ProviderDetail[]>([]);

  const [address, setAddress] = useState<string | undefined>();
  const [isConnected, setIsConnected] = useState(false);
  
  // Initialize wallet discovery and watch account changes
  useEffect(() => {
    const account = getAccount(config);
    setAddress(account.address);
    setIsConnected(account.isConnected);
    
    // Initialize EIP-6963 wallet discovery
    initializeWalletDiscovery();
    
    // Update discovered wallets after a short delay
    const timeout = setTimeout(() => {
      setDiscoveredWallets(getDiscoveredWallets());
    }, 200);
    
    const unwatch = watchAccount(config, {
      onChange: (account) => {
        setAddress(account.address);
        setIsConnected(account.isConnected);
      },
    });
    
    return () => {
      clearTimeout(timeout);
      unwatch();
    };
  }, []);

  useEffect(() => {
    if (isConnected && address && !isAuthenticating) {
      handleWalletAuth();
    }
  }, [isConnected, address]);

  const handleWalletAuth = async () => {
    if (!address) return;

    setIsAuthenticating(true);
    setGlobalError('');
    setLoading(true);

    try {
      // Get authentication message from backend
      const nonceResponse = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });

      if (!nonceResponse.ok) {
        throw new Error('Impossible de récupérer le message d\'authentification');
      }

      const nonceData = await nonceResponse.json();
      console.log('Nonce response:', nonceData);
      const { message } = nonceData.data;

      // Sign the message
      console.log('Signing message:', message);
      const signature = await signMessage(config, { 
        message: message
      });

      // Authenticate with backend
      await api.authenticateWallet(address, message, signature);
      
      navigate('/browse');
    } catch (error) {
      console.error('Wallet authentication error:', error);
      setGlobalError(error instanceof Error ? error.message : 'Erreur d\'authentification avec le compte');
      disconnect(config);
    } finally {
      setLoading(false);
      setIsAuthenticating(false);
    }
  };

  const handleDisconnect = () => {
    disconnect(config);
    setGlobalError('');
    setIsAuthenticating(false);
  };

  const handleConnectWallet = async (wallet: EIP6963ProviderDetail) => {
    if (!agreedToTerms) {
      setGlobalError('Veuillez accepter les conditions d\'utilisation');
      return;
    }

    setConnecting(wallet.info.rdns);
    setGlobalError('');
    
    try {
      // Connect directly using the wallet's provider
      const accounts = await wallet.provider.request({ 
        method: 'eth_requestAccounts' 
      });
      
      console.log(`Connected to ${wallet.info.name}:`, accounts[0]);
      setAddress(accounts[0]);
      setIsConnected(true);
      
    } catch (err: any) {
      console.error('Connection error:', err);
      setGlobalError(err.message || 'Échec de la connexion au wallet');
    } finally {
      setConnecting(null);
    }
  };

  const refreshWallets = () => {
    initializeWalletDiscovery();
    setTimeout(() => {
      setDiscoveredWallets(getDiscoveredWallets());
    }, 200);
  };

  const handleEmailAuth = async () => {
    if (!agreedToTerms) {
      setGlobalError('Veuillez accepter les conditions d\'utilisation');
      return;
    }

    if (!email || !password) {
      setGlobalError('Email et mot de passe requis');
      return;
    }

    setConnecting('email');
    setGlobalError('');
    
    try {
      if (isRegistering) {
        await authStore.registerWithEmail(email, password);
      } else {
        await authStore.loginWithEmail(email, password);
      }
      navigate('/browse');
    } catch (err: any) {
      console.error('Email auth error:', err);
      setGlobalError(err.message || 'Échec de l\'authentification');
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600">SafeSign</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Connecter un compte
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous pour accéder à vos documents
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            {globalError && (
              <Alert variant="error" className="mb-4">{globalError}</Alert>
            )}

            {!isConnected ? (
              <div className="space-y-4">
                {/* Terms Acceptance */}
                <div className="flex items-start space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms((e.target as HTMLInputElement).checked)}
                    className="rounded mt-0.5"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    J'accepte les{' '}
                    <a href="/terms" target="_blank" className="text-blue-600 underline">
                      Conditions d'utilisation
                    </a>{' '}
                    et la{' '}
                    <a href="/privacy" target="_blank" className="text-blue-600 underline">
                      Politique de confidentialité
                    </a>
                  </label>
                </div>

                {/* Email Authentication */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="votre@email.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Votre mot de passe"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsRegistering(!isRegistering)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {isRegistering ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
                    </button>
                  </div>
                  
                  <Button
                    onClick={handleEmailAuth}
                    disabled={!agreedToTerms || connecting === 'email'}
                    className="w-full"
                  >
                    {connecting === 'email' ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{isRegistering ? 'Inscription...' : 'Connexion...'}</span>
                      </div>
                    ) : (
                      <span>{isRegistering ? 'S\'inscrire' : 'Se connecter'}</span>
                    )}
                  </Button>
                </div>
                
                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">ou</span>
                  </div>
                </div>
                
                {/* Web3 Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">Wallets détectés</h3>
                    <button
                      onClick={refreshWallets}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Actualiser
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {discoveredWallets.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        <p>Aucun wallet détecté.</p>
                        <p className="mt-1">Installez une extension wallet et actualisez.</p>
                      </div>
                    ) : (
                      discoveredWallets.map((wallet) => {
                        const isConnecting = connecting === wallet.info.rdns;
                        const fallbackIcon = WALLET_ICONS[wallet.info.name] || WALLET_ICONS['Injected'];
                        
                        return (
                          <Button
                            key={wallet.info.rdns}
                            variant="outline"
                            className="w-full justify-start h-12 px-3 rounded-lg border hover:border-blue-300 transition-colors"
                            onClick={() => handleConnectWallet(wallet)}
                            disabled={!agreedToTerms || isConnecting}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-50 rounded-md flex items-center justify-center overflow-hidden">
                                  {wallet.info.icon ? (
                                    <img
                                      src={wallet.info.icon}
                                      alt={wallet.info.name}
                                      className="object-contain w-6 h-6"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = fallbackIcon;
                                      }}
                                    />
                                  ) : (
                                    <img
                                      src={fallbackIcon}
                                      alt={wallet.info.name}
                                      className="object-contain w-6 h-6"
                                    />
                                  )}
                                </div>
                                <div className="text-left">
                                  <span className="font-medium text-sm block">{wallet.info.name}</span>
                                  {wallet.info.rdns.startsWith('legacy.') && (
                                    <span className="text-xs text-gray-500">Legacy</span>
                                  )}
                                </div>
                              </div>
                              {isConnecting && (
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              )}
                            </div>
                          </Button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center space-y-1">
                  <p>
                    Pas de wallet ?{' '}
                    <a
                      href="https://ethereum.org/en/wallets/find-wallet/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Découvrez comment en obtenir un
                    </a>
                  </p>
                  <p>Avec l'email, nous dérivons une clé privée sécurisée pour vous.</p>
                  <p className="text-green-600">✅ Bundle optimisé - EIP-6963 wallet detection</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Compte connecté :</p>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                    {address}
                  </p>
                </div>
                
                {isAuthenticating ? (
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-600">Authentification en cours...</span>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={handleDisconnect}
                    variant="outline"
                    className="w-full"
                  >
                    Déconnecter
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};