import { auth } from '../auth.js';
import type { ApiResponse } from '../../common/types.js';
import { generateId } from '../../common/utils.js';

export const authRoutes = {
  'POST /api/auth/register': async (req: Request): Promise<Response> => {
    try {
      const { email, password } = await req.json();
      
      if (!email || !password) {
        return Response.json({
          success: false,
          error: 'Email et mot de passe requis'
        } as ApiResponse<null>, { status: 400 });
      }

      const result = await auth.registerWithEmail(email, password);
      
      return Response.json({
        success: true,
        data: {
          user: result.user,
          token: result.token.jwt
        }
      } as ApiResponse<any>);
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      } as ApiResponse<null>, { status: 400 });
    }
  },

  'POST /api/auth/login': async (req: Request): Promise<Response> => {
    try {
      const { email, password } = await req.json();
      
      if (!email || !password) {
        return Response.json({
          success: false,
          error: 'Email et mot de passe requis'
        } as ApiResponse<null>, { status: 400 });
      }

      const result = await auth.loginWithEmail(email, password);
      
      return Response.json({
        success: true,
        data: {
          user: result.user,
          token: result.token.jwt
        }
      } as ApiResponse<any>);
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      } as ApiResponse<null>, { status: 401 });
    }
  },

  'POST /api/auth/logout': async (req: Request): Promise<Response> => {
    try {
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        auth.logout(token);
      }
      
      return Response.json({
        success: true,
        message: 'Déconnexion réussie'
      } as ApiResponse<null>);
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      } as ApiResponse<null>, { status: 500 });
    }
  },

  'GET /api/auth/me': async (req: Request): Promise<Response> => {
    try {
      const user = await auth.requireAuth(req);
      
      return Response.json({
        success: true,
        data: user
      } as ApiResponse<any>);
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : 'Non authentifié'
      } as ApiResponse<null>, { status: 401 });
    }
  },

  'POST /api/auth/nonce': async (req: Request): Promise<Response> => {
    try {
      const { address } = await req.json();
      
      if (!address) {
        return Response.json({
          success: false,
          error: 'Adresse de compte requise'
        } as ApiResponse<null>, { status: 400 });
      }

      // Generate a unique nonce for this authentication attempt
      const nonce = await generateId();
      const message = auth.generateAuthMessage(address, nonce);
      
      return Response.json({
        success: true,
        data: { message, nonce }
      } as ApiResponse<any>);
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      } as ApiResponse<null>, { status: 500 });
    }
  },

  'POST /api/auth/wallet': async (req: Request): Promise<Response> => {
    try {
      const { address, message, signature } = await req.json();
      
      if (!address || !message || !signature) {
        return Response.json({
          success: false,
          error: 'Adresse, message et signature requis'
        } as ApiResponse<null>, { status: 400 });
      }

      const result = await auth.authenticateWallet(address, message, signature);
      
      return Response.json({
        success: true,
        data: {
          user: result.user,
          token: result.token.jwt
        }
      } as ApiResponse<any>);
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur d\'authentification'
      } as ApiResponse<null>, { status: 401 });
    }
  }
};