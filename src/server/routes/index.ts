import { authRoutes } from './auth.js';
import { documentRoutes } from './documents.js';
import { signingRoutes } from './signing.js';

// Combine all routes
export const routes = {
  ...authRoutes,
  ...documentRoutes,
  ...signingRoutes,

  // Health check
  'GET /api/health': async (): Promise<Response> => {
    return Response.json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString()
    });
  }
};