import { ComponentType, createContext, FunctionComponent } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';

interface Route {
  path: string;
  component: ComponentType<any>;
}

interface RouterContextValue {
  currentPath: string;
  params: Record<string, string>;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextValue>({
  currentPath: '/',
  params: {},
  navigate: () => {}
});

export const useRouter = () => useContext(RouterContext);

export class Router {
  private routes: Route[] = [];
  private listeners: Set<() => void> = new Set();
  private currentPath = window.location.pathname;
  private params: Record<string, string> = {};

  constructor() {
    window.addEventListener('popstate', () => {
      this.currentPath = window.location.pathname;
      this.notifyListeners();
    });

    // Handle clicks on links
    document.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.href && target.origin === window.location.origin) {
        // Don't intercept if:
        // - Ctrl/Cmd+click (open in new tab)
        // - Right click (context menu)
        // - Middle click (open in new tab)
        // - Shift+click (open in new window)
        // - Alt+click (download)
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button === 1 || e.button === 2) {
          return; // Let browser handle it
        }
        
        const path = target.pathname;
        if (path !== this.currentPath) {
          e.preventDefault();
          this.navigate(path);
        }
      }
    });
  }

  addRoute(path: string, component: ComponentType<any>) {
    this.routes.push({ path, component });
  }

  navigate(path: string) {
    if (path !== this.currentPath) {
      window.history.pushState({}, '', path);
      this.currentPath = path;
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    // Use setTimeout to ensure the DOM has updated before notifying listeners
    setTimeout(() => {
      this.listeners.forEach(listener => listener());
    }, 0);
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getCurrentRoute() {
    // Always use the current window location in case of direct navigation
    const currentPath = window.location.pathname;
    this.currentPath = currentPath;
    
    for (const route of this.routes) {
      const match = this.matchPath(route.path, currentPath);
      if (match) {
        this.params = match.params;
        return { component: route.component, params: match.params };
      }
    }
    
    return null;
  }

  private matchPath(routePath: string, currentPath: string) {
    const routeSegments = routePath.split('/');
    const pathSegments = currentPath.split('/');
    
    if (routeSegments.length !== pathSegments.length) {
      return null;
    }
    
    const params: Record<string, string> = {};
    
    for (let i = 0; i < routeSegments.length; i++) {
      if (routeSegments[i].startsWith(':')) {
        params[routeSegments[i].slice(1)] = pathSegments[i];
      } else if (routeSegments[i] !== pathSegments[i]) {
        return null;
      }
    }
    
    return { params };
  }

  getParams() {
    return this.params;
  }
}

// Global router instance
export const router = new Router();

// Router Provider Component
export const RouterProvider: FunctionComponent = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = router.subscribe(() => {
      setCurrentPath(window.location.pathname);
      setParams(router.getParams());
    });
    
    return unsubscribe;
  }, []);

  const navigate = (path: string) => {
    router.navigate(path);
  };

  return (
    <RouterContext.Provider value={{ currentPath, params, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

// Route Component
export const Route: FunctionComponent<{ path: string; component: ComponentType<any> }> = ({ path, component }) => {
  useEffect(() => {
    router.addRoute(path, component);
  }, [path, component]);
  
  return null;
};

// Routes Component
export const Routes: FunctionComponent = () => {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const unsubscribe = router.subscribe(() => {
      forceUpdate(prev => prev + 1);
    });
    
    return unsubscribe;
  }, []);

  const currentRoute = router.getCurrentRoute();
  
  if (!currentRoute) {
    return <div>404 - Page non trouvée</div>;
  }
  
  const { component: Component, params } = currentRoute;
  return <Component {...params} />;
};

// Link Component
export const Link: FunctionComponent<{ href: string; className?: string }> = ({ href, className, children }) => {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
};