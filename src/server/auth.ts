import { generateId, generateTokenId, createJWT, verifyJWT } from '../common/utils.js';
import { verifyMessage } from 'viem';
import { storage } from './storage.js';
import type { User, AuthToken } from '../common/types.js';
import { UserRole } from '../common/types.js';
import { generateSalt, derivePrivateKey, hashPassword, verifyPassword, generateSessionToken, hexToBytes } from './utils/crypto.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const TOKEN_RENEWAL_THRESHOLD = 15 * 60 * 1000; // 15 minutes

export class AuthService {
  generateAuthMessage(address: string, nonce: string): string {
    return `Authentification SafeSign\n\nAdresse: ${address}\nNonce: ${nonce}\nDate: ${new Date().toISOString()}`;
  }

  async authenticateWallet(address: string, message: string, signature: string): Promise<{ user: User; token: AuthToken }> {
    // Verify the signature
    const isValidSignature = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`
    });

    if (!isValidSignature) {
      throw new Error('Signature invalide');
    }

    // Find or create user by wallet address
    let user = storage.getUserByWalletAddress(address.toLowerCase());
    
    if (!user) {
      // Create new user with wallet address
      const userId = await generateId();
      user = {
        id: userId,
        walletAddress: address.toLowerCase(),
        createdAt: new Date(),
        isActive: true,
        role: UserRole.USER
      };
      storage.setUser(userId, user);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Compte désactivé');
    }

    // Update last login
    user.lastLoginAt = new Date();
    storage.setUser(user.id, user);

    // Create auth token
    const token = await this.createAuthToken(user.id);

    return { user, token };
  }

  async registerWithEmail(email: string, password: string): Promise<{ user: User; token: AuthToken }> {
    // Check if user already exists
    const existingUser = storage.getUserByEmail(email);
    if (existingUser) {
      throw new Error('Un compte existe déjà avec cet email');
    }

    // Generate salt and hash password
    const salt = generateSalt();
    const passwordHash = await hashPassword(password);
    
    // Create new user (no private key stored)
    const userId = await generateId();
    const user: User = {
      id: userId,
      email,
      passwordHash,
      salt,
      createdAt: new Date(),
      isActive: true,
      role: UserRole.USER
    };
    
    storage.setUser(userId, user);
    
    // Derive private key from credentials (using RAW password, not salted)
    const privateKey = await derivePrivateKey({
      email,
      password, // Raw password - not salted
      salt: hexToBytes(salt)
    });
    
    // Store private key in session (expires with token)
    const tokenExpiresAt = new Date(Date.now() + TOKEN_EXPIRY);
    storage.setSessionKey(userId, privateKey, tokenExpiresAt);
    
    const sessionToken = await generateSessionToken(privateKey);
    const token = await this.createAuthToken(userId, sessionToken);
    
    // Clear password from memory immediately after key derivation
    (password as any) = null;
    
    return { user, token };
  }

  async loginWithEmail(email: string, password: string): Promise<{ user: User; token: AuthToken }> {
    // Find user by email
    const user = storage.getUserByEmail(email);
    if (!user || !user.passwordHash || !user.salt) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Compte désactivé');
    }

    // Update last login
    user.lastLoginAt = new Date();
    storage.setUser(user.id, user);

    // Derive private key from credentials (using RAW password, not salted)
    const privateKey = await derivePrivateKey({
      email,
      password, // Raw password - not salted
      salt: hexToBytes(user.salt)
    });
    
    // Store private key in session (expires with token)
    const tokenExpiresAt = new Date(Date.now() + TOKEN_EXPIRY);
    storage.setSessionKey(user.id, privateKey, tokenExpiresAt);
    
    const sessionToken = await generateSessionToken(privateKey);
    const token = await this.createAuthToken(user.id, sessionToken);
    
    // Clear password from memory immediately after key derivation
    (password as any) = null;

    return { user, token };
  }

  async createAuthToken(userId: string, sessionToken?: string): Promise<AuthToken> {
    const tokenId = sessionToken || await generateTokenId();
    const jwt = createJWT({ userId, tokenId }, JWT_SECRET, '24h');
    
    const authToken: AuthToken = {
      jwt,
      userId,
      expiresAt: new Date(Date.now() + TOKEN_EXPIRY),
      issuedAt: new Date(),
      tokenHash: tokenId
    };

    storage.setToken(jwt, authToken);
    return authToken;
  }

  async validateToken(jwt: string): Promise<{ user: User; shouldRenew: boolean } | null> {
    // Check if token exists in storage
    const authToken = storage.getToken(jwt);
    if (!authToken) {
      return null;
    }

    // Verify JWT
    const payload = verifyJWT(jwt, JWT_SECRET);
    if (!payload || payload.userId !== authToken.userId) {
      return null;
    }

    // Get user
    const user = storage.getUser(authToken.userId);
    if (!user || !user.isActive) {
      return null;
    }

    // Check if token should be renewed (within 15 minutes of expiry)
    const timeUntilExpiry = authToken.expiresAt.getTime() - Date.now();
    const shouldRenew = timeUntilExpiry < TOKEN_RENEWAL_THRESHOLD;

    return { user, shouldRenew };
  }

  async renewToken(oldJwt: string): Promise<AuthToken | null> {
    const validation = await this.validateToken(oldJwt);
    if (!validation) {
      return null;
    }

    // Delete old token
    storage.deleteToken(oldJwt);

    // Create new token
    return this.createAuthToken(validation.user.id);
  }

  logout(jwt: string): void {
    // Get token to find user ID before deleting
    const authToken = storage.getToken(jwt);
    if (authToken) {
      // Remove session key when logging out
      storage.removeSessionKey(authToken.userId);
    }
    storage.deleteToken(jwt);
  }

  // Middleware for protected routes
  async requireAuth(req: Request): Promise<User> {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Token d\'authentification manquant');
    }

    const token = authHeader.substring(7);
    const validation = await this.validateToken(token);
    
    if (!validation) {
      throw new Error('Token invalide ou expiré');
    }

    // Auto-renew token if needed
    if (validation.shouldRenew) {
      const newToken = await this.renewToken(token);
      if (newToken) {
        // Add new token to response headers (handled by route)
        (req as any).newAuthToken = newToken;
      }
    }

    return validation.user;
  }

  // Admin check
  requireAdmin(user: User): void {
    if (user.role !== UserRole.ADMIN) {
      throw new Error('Accès administrateur requis');
    }
  }

  // Get private key for signing operations
  getSessionPrivateKey(userId: string): string | null {
    return storage.getSessionKey(userId);
  }
}

export const auth = new AuthService();