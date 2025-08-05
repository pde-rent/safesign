import { ComponentChildren } from 'preact';
import { Link, useRouter } from '../lib/router.js';
import { useUser, useStore } from '../lib/store.js';
import { api } from '../lib/api.js';
import { Button } from './ui.js';
import { cn } from '../../common/utils.js';

interface LayoutProps {
  children: ComponentChildren;
}

export const Layout = ({ children }: LayoutProps) => {
  const user = useUser();
  const { navigate } = useRouter();
  const logout = useStore(state => state.logout);

  const handleLogout = async () => {
    await api.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                SafeSign
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/browse" className="text-gray-700 hover:text-gray-900">
                    Mes Documents
                  </Link>
                  <Link href="/new">
                    <Button variant="primary" size="sm">
                      Nouveau Document
                    </Button>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{user.email || user.walletAddress?.slice(0, 6) + '...' + user.walletAddress?.slice(-4)}</span>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                      Déconnexion
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="primary" size="sm">
                      Commencer
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2024 SafeSign - Génération de documents de location
          </p>
        </div>
      </footer>
    </div>
  );
};

interface PageContainerProps {
  children: ComponentChildren;
  className?: string;
}

export const PageContainer = ({ children, className }: PageContainerProps) => (
  <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8', className)}>
    {children}
  </div>
);

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ComponentChildren;
}

export const PageHeader = ({ title, description, actions }: PageHeaderProps) => (
  <div className="mb-8">
    <div className="md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-2 text-gray-600">{description}</p>
        )}
      </div>
      {actions && (
        <div className="mt-4 flex md:mt-0 md:ml-4">
          {actions}
        </div>
      )}
    </div>
  </div>
);