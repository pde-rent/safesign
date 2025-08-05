import { routes } from './routes/index.js';
import { storage } from './storage.js';

// Route matcher
function matchRoute(method: string, path: string): { handler: Function; params: Record<string, string> } | null {
  for (const [routeKey, handler] of Object.entries(routes)) {
    const [routeMethod, routePath] = routeKey.split(' ');
    
    if (routeMethod !== method) continue;
    
    const routeSegments = routePath.split('/');
    const pathSegments = path.split('/');
    
    if (routeSegments.length !== pathSegments.length) continue;
    
    const params: Record<string, string> = {};
    let match = true;
    
    for (let i = 0; i < routeSegments.length; i++) {
      if (routeSegments[i].startsWith(':')) {
        params[routeSegments[i].slice(1)] = pathSegments[i];
      } else if (routeSegments[i] !== pathSegments[i]) {
        match = false;
        break;
      }
    }
    
    if (match) {
      return { handler, params };
    }
  }
  
  return null;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};

// Create server
const server = Bun.serve({
  port: 3001,
  async fetch(req) {
    const url = new URL(req.url);
    const method = req.method;
    const path = url.pathname;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Find matching route
    const match = matchRoute(method, path);
    
    if (match) {
      try {
        const response = await match.handler(req, match.params);
        
        // Add CORS headers to response
        const headers = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });
        
        // Check for token renewal
        if ((req as any).newAuthToken) {
          headers.set('X-New-Token', (req as any).newAuthToken.jwt);
        }
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      } catch (error) {
        console.error('Route error:', error);
        return Response.json(
          { success: false, error: 'Erreur serveur interne' },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // 404 for unmatched routes
    return Response.json(
      { success: false, error: 'Route non trouvée' },
      { status: 404, headers: corsHeaders }
    );
  }
});

// Initialize storage
await storage.init();

// Cleanup expired tokens periodically
setInterval(() => {
  storage.cleanExpiredTokens();
}, 60 * 60 * 1000); // Every hour

console.log(`🌐 SafeSign Server: http://localhost:${server.port}`);
console.log(`📊 Storage: ${storage.getStats().users} users, ${storage.getStats().documents} documents`);