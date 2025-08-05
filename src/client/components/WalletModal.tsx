import { useState } from 'preact/hooks';
import { useConnect, useAccount, type Connector } from 'wagmi';
import { Button, Card, CardContent } from './ui.js';
import { authStore } from '../stores/auth.js';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export const WalletModal = ({ isOpen, onClose }: WalletModalProps) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const { connectAsync, connectors } = useConnect();
  const { isConnected } = useAccount();

  const handleConnect = async (connector: Connector) => {
    if (!agreedToTerms) {
      setError('Veuillez accepter les conditions d\'utilisation');
      return;
    }

    setConnecting(connector.id);
    setError('');
    
    try {
      await connectAsync({ connector });
      console.log(`Connected to ${connector.name}`);
      onClose();
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message || 'Échec de la connexion au compte');
    } finally {
      setConnecting(null);
    }
  };

  const handleEmailAuth = async () => {
    if (!agreedToTerms) {
      setError('Veuillez accepter les conditions d\'utilisation');
      return;
    }

    if (!email || !password) {
      setError('Email et mot de passe requis');
      return;
    }

    setConnecting('email');
    setError('');
    
    try {
      if (isRegistering) {
        await authStore.registerWithEmail(email, password);
      } else {
        await authStore.loginWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      console.error('Email auth error:', err);
      setError(err.message || 'Échec de l\'authentification');
    } finally {
      setConnecting(null);
    }
  };

  if (isConnected) {
    onClose();
    return null;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Connecter un compte</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>
          
          
          <div className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
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
              <div className="space-y-2">
                {connectors.map((connector) => {
                  const isConnecting = connecting === connector.id;
                  const icon = WALLET_ICONS[connector.name] || WALLET_ICONS['Injected'];
                  
                  return (
                    <Button
                      key={connector.id}
                      variant="outline"
                      className="w-full justify-start h-12 px-3 rounded-lg border hover:border-blue-300 transition-colors"
                      onClick={() => handleConnect(connector)}
                      disabled={!agreedToTerms || isConnecting}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-50 rounded-md flex items-center justify-center overflow-hidden">
                            <img
                              src={icon}
                              alt={connector.name}
                              className="object-contain w-6 h-6"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = WALLET_ICONS['Injected'];
                              }}
                            />
                          </div>
                          <span className="font-medium text-sm text-left">{connector.name}</span>
                        </div>
                        {isConnecting && (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                    </Button>
                  );
                })}
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};