import { render } from 'preact';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, Routes, Route } from './lib/router.js';
import { LandingPage } from './pages/landing.js';
import { LoginPage } from './pages/login.js';
import { BrowsePage } from './pages/browse.js';
import { NewDocumentPage } from './pages/new.js';
import { EditDocumentPage } from './pages/edit.js';
import { config } from './lib/wagmi.js';
import './styles.css';

// Register routes
import { router } from './lib/router.js';

router.addRoute('/', LandingPage);
router.addRoute('/login', LoginPage);
router.addRoute('/browse', BrowsePage);
router.addRoute('/new', NewDocumentPage);
router.addRoute('/edit/:id', EditDocumentPage);

const queryClient = new QueryClient();

const App = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider>
          <Routes />
        </RouterProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

render(<App />, document.getElementById('app')!);