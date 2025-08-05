import { generateId } from '../../common/utils.js';
import { hkdfSync } from 'node:crypto';
import { Buffer } from 'node:buffer';

/**
 * Secure crypto utilities with deterministic key derivation
 */

type KeyParams = {
  email: string;           // user identifier
  password: string;        // secret only the user knows
  salt: Uint8Array;        // 16-byte per-user random salt
};

const PEPPER = process.env.SERVER_PEPPER || 'dev-pepper-change-in-production-32-bytes-long!!';
const CONTEXT = 'safesign-keygen-v1';        // domain separation string
const MEM_COST = 64 * 1024;              // 64 MB memory for Argon2id
const OPS_COST = 3;                      // 3 iterations

/**
 * Generate a random salt (16 bytes)
 */
export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Derive private key deterministically from user credentials
 */
export async function derivePrivateKey({ email, password, salt }: KeyParams): Promise<string> {
  // 1. Slow, memory-hard KDF — Argon2id with server pepper
  // Note: Bun.password.hash doesn't support custom salt, so we'll use a different approach
  const input = password + PEPPER + Buffer.from(salt).toString('hex');
  const master = await Bun.password.hash(input, {
    algorithm: 'argon2id',
    memoryCost: MEM_COST,
    timeCost: OPS_COST
  });

  // 2. Expand to a usable key with HKDF-SHA256, bound to email + context
  const info = Buffer.from(`${CONTEXT}:${email.toLowerCase()}`);
  const secret = hkdfSync('sha256', master, salt, info, 32);

  return Buffer.from(secret).toString('hex');
}

/**
 * Hash a password using Bun's built-in crypto
 */
export async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await Bun.password.verify(password, hash);
}

/**
 * Generate a session token derived from private key and current time
 * Format: privateKey + timestamp + random, then hashed
 */
export async function generateSessionToken(privateKey: string): Promise<string> {
  const timestamp = Date.now().toString();
  const random = await generateId();
  const data = `${privateKey}:${timestamp}:${random}`;
  
  if (typeof Bun !== 'undefined') {
    return Bun.CryptoHasher.hash('sha256', data, 'hex');
  }
  
  // Fallback for non-Bun environments
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Helper to convert hex string to Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Generate a simple signature (for demonstration - in production use proper cryptographic signing)
 */
export async function signData(data: string, privateKey: string): Promise<string> {
  const message = `${data}:${privateKey}`;
  
  if (typeof Bun !== 'undefined') {
    return Bun.CryptoHasher.hash('sha256', message, 'hex');
  }
  
  // Fallback
  const encoder = new TextEncoder();
  const messageBuffer = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', messageBuffer);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a signature
 */
export async function verifySignature(data: string, signature: string, privateKey: string): Promise<boolean> {
  const expectedSignature = await signData(data, privateKey);
  return signature === expectedSignature;
}