import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { generateId } from '../common/utils.js';
import type { User, Document, AuthToken } from '../common/types.js';
import { UserRole } from '../common/types.js';

interface StorageData {
  users: [string, User][];
  documents: [string, Document][];
  tokens: [string, AuthToken][];
}

interface SessionKeys {
  [userId: string]: {
    privateKey: string;
    expiresAt: Date;
  };
}

class InMemoryStorage {
  private users = new Map<string, User>();
  private documents = new Map<string, Document>();
  private tokens = new Map<string, AuthToken>();
  private sessionKeys: SessionKeys = {};
  private dataDir = './data';
  private backupFile = './data/backup.json';
  private autosaveInterval: Timer | null = null;

  async init(): Promise<void> {
    // Create data directory if it doesn't exist
    if (!existsSync(this.dataDir)) {
      await mkdir(this.dataDir, { recursive: true });
    }

    // Load existing data
    await this.load();

    // Create default user if no users exist
    await this.createDefaultUser();

    // Start autosave
    this.startAutoSave();

    // Setup graceful shutdown handlers
    this.setupSignalHandlers();
  }

  private setupSignalHandlers(): void {
    const gracefulShutdown = async (signal: string) => {
      console.log(`📟 Received ${signal}, performing graceful shutdown...`);
      
      // Stop autosave interval
      this.stopAutoSave();
      
      // Save data one final time
      await this.save();
      
      console.log(`💾 Data saved before shutdown`);
      process.exit(0);
    };

    // Handle various termination signals
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart
    
    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      console.error('❌ Uncaught Exception:', error);
      await this.save();
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      await this.save();
      process.exit(1);
    });

    console.log('📟 Signal handlers registered for graceful shutdown');
  }

  async createDefaultUser(): Promise<void> {
    // Only create default user if no users exist
    if (this.users.size === 0) {
      const userId = await generateId();
      // Using a test wallet address for development - replace with your actual address
      const defaultUser: User = {
        id: userId,
        walletAddress: '0x1234567890123456789012345678901234567890', // Development test address
        firstName: 'Paul',
        lastName: 'Admin',
        email: 'paul@safesign.com',
        createdAt: new Date(),
        isActive: true,
        role: UserRole.ADMIN
      };
      
      this.setUser(userId, defaultUser);
      console.log(`👤 Created default user with wallet: ${defaultUser.walletAddress} (ID: ${userId.substring(0, 8)}...)`);
    }
  }

  async load(): Promise<void> {
    try {
      if (existsSync(this.backupFile)) {
        const data = await readFile(this.backupFile, 'utf-8');
        const parsed: StorageData = JSON.parse(data);
        
        // Restore users
        if (parsed.users) {
          this.users = new Map(parsed.users);
        }
        
        // Restore documents
        if (parsed.documents) {
          this.documents = new Map(parsed.documents);
        }
        
        // Restore tokens (filter out expired ones)
        if (parsed.tokens) {
          const now = new Date();
          parsed.tokens.forEach(([key, token]) => {
            if (new Date(token.expiresAt) > now) {
              this.tokens.set(key, token);
            }
          });
        }
        
        console.log(`📦 Loaded data from backup: ${this.users.size} users, ${this.documents.size} documents`);
      }
    } catch (error) {
      console.error('❌ Error loading backup:', error);
    }
  }

  async save(): Promise<void> {
    try {
      const data: StorageData = {
        users: Array.from(this.users.entries()),
        documents: Array.from(this.documents.entries()),
        tokens: Array.from(this.tokens.entries())
      };
      
      // Write to temp file first, then rename (atomic operation)
      const tempFile = `${this.backupFile}.tmp`;
      await writeFile(tempFile, JSON.stringify(data, null, 2));
      
      // Rename temp file to actual backup file
      await Bun.write(this.backupFile, await Bun.file(tempFile).text());
      await Bun.file(tempFile).unlink();
      
      console.log(`💾 Saved backup: ${this.users.size} users, ${this.documents.size} documents`);
    } catch (error) {
      console.error('❌ Error saving backup:', error);
    }
  }

  startAutoSave(intervalMs = 5 * 60 * 1000): void { // 5 minutes
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
    }
    
    this.autosaveInterval = setInterval(() => {
      this.save();
      // Clean expired tokens and session keys
      this.cleanExpiredTokens();
      this.cleanExpiredSessionKeys();
    }, intervalMs);
    
    console.log(`💾 Auto-save: every ${intervalMs / 1000}s`);
  }

  stopAutoSave(): void {
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
      this.autosaveInterval = null;
    }
  }

  // User operations
  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  getUserByWalletAddress(walletAddress: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.walletAddress === walletAddress);
  }

  setUser(id: string, user: User): void {
    this.users.set(id, user);
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Document operations
  getDocument(id: string): Document | undefined {
    return this.documents.get(id);
  }

  getDocumentByEnvelopeId(envelopeId: string): Document | undefined {
    return Array.from(this.documents.values()).find(d => d.envelopeId === envelopeId);
  }

  getDocumentByShareLink(shareLink: string): Document | undefined {
    return Array.from(this.documents.values()).find(d => d.shareLink === shareLink);
  }

  setDocument(id: string, document: Document): void {
    this.documents.set(id, document);
  }

  deleteDocument(id: string): boolean {
    return this.documents.delete(id);
  }

  getUserDocuments(userId: string): Document[] {
    return Array.from(this.documents.values())
      .filter(doc => doc.createdBy === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getAllDocuments(): Document[] {
    return Array.from(this.documents.values());
  }

  // Token operations
  getToken(token: string): AuthToken | undefined {
    const authToken = this.tokens.get(token);
    if (authToken && new Date(authToken.expiresAt) > new Date()) {
      return authToken;
    }
    // Remove expired token
    if (authToken) {
      this.tokens.delete(token);
    }
    return undefined;
  }

  setToken(token: string, authToken: AuthToken): void {
    this.tokens.set(token, authToken);
  }

  deleteToken(token: string): boolean {
    return this.tokens.delete(token);
  }

  cleanExpiredTokens(): void {
    const now = new Date();
    for (const [token, authToken] of this.tokens.entries()) {
      if (new Date(authToken.expiresAt) <= now) {
        // Remove associated session key when token expires
        this.removeSessionKey(authToken.userId);
        this.tokens.delete(token);
      }
    }
  }

  // Session key operations (NOT persisted to disk for security)
  setSessionKey(userId: string, privateKey: string, expiresAt: Date): void {
    this.sessionKeys[userId] = { privateKey, expiresAt };
  }

  getSessionKey(userId: string): string | null {
    const session = this.sessionKeys[userId];
    if (!session) return null;
    
    // Check if expired
    if (new Date() > session.expiresAt) {
      delete this.sessionKeys[userId];
      return null;
    }
    
    return session.privateKey;
  }

  removeSessionKey(userId: string): void {
    delete this.sessionKeys[userId];
  }

  cleanExpiredSessionKeys(): void {
    const now = new Date();
    for (const [userId, session] of Object.entries(this.sessionKeys)) {
      if (new Date(session.expiresAt) <= now) {
        delete this.sessionKeys[userId];
      }
    }
  }

  // Stats
  getStats() {
    return {
      users: this.users.size,
      documents: this.documents.size,
      tokens: this.tokens.size,
      memory: process.memoryUsage()
    };
  }
}

// Singleton instance
export const storage = new InMemoryStorage();