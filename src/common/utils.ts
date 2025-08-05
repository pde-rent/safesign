import { Currency } from './types.js';

// Generate hash-based ID using Argon2id (12 bytes = 24 hex chars)
const generateArgon2Id = async (input: string): Promise<string> => {
  if (typeof Bun !== 'undefined') {
    // Use Bun's native Argon2id for secure hashing
    const hash = await Bun.password.hash(input, {
      algorithm: "argon2id",
    });
    // Extract the hash part (after the last $) and convert to hex
    const hashPart = hash.split('$').pop() || '';
    // Convert base64 to hex and take first 24 chars (12 bytes)
    const buffer = Buffer.from(hashPart, 'base64');
    return buffer.toString('hex').substring(0, 24);
  } else {
    // Fallback for browser/other environments - simple hash
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(24, '0').substring(0, 24);
  }
};

// Standard ID generation (24 hex characters = 12 bytes)
export const generateId = async (): Promise<string> => {
  const randomInput = crypto.randomUUID() + Date.now();
  return await generateArgon2Id(randomInput);
};

// Generate envelope ID based on time + signers + name (24 hex characters = 12 bytes)
export const generateEnvelopeId = async (signers: string[] = [], name: string = ''): Promise<string> => {
  const input = `${Date.now()}-${signers.join(',')}-${name}`;
  return await generateArgon2Id(input);
};

// Generate token ID (24 hex characters = 12 bytes)
export const generateTokenId = async (): Promise<string> => {
  const randomInput = crypto.randomUUID() + Date.now() + Math.random();
  return await generateArgon2Id(randomInput);
};

export const cn = (...classes: (string | undefined | null | false | any)[]) => 
  classes.filter(Boolean).map(c => String(c)).join(' ');

export const formatDate = (date: Date, format = 'DD/MM/YYYY'): string => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', String(year));
};

export const formatCurrency = (amount: number, currency: Currency = Currency.EUR): string => {
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return formatter.format(amount);
};

export const formatNumberToWords = (num: number): string => {
  const ones = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  const hundreds = ['', 'cent', 'deux cents', 'trois cents', 'quatre cents', 'cinq cents', 'six cents', 'sept cents', 'huit cents', 'neuf cents'];
  
  if (num === 0) return 'zéro';
  if (num < 0) return 'moins ' + formatNumberToWords(-num);
  
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    if (ten === 7 || ten === 9) {
      return tens[ten - 1] + '-' + teens[one];
    }
    return tens[ten] + (one ? '-' + ones[one] : '');
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    return hundreds[hundred] + (remainder ? ' ' + formatNumberToWords(remainder) : '');
  }
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    return (thousand === 1 ? 'mille' : formatNumberToWords(thousand) + ' mille') + 
           (remainder ? ' ' + formatNumberToWords(remainder) : '');
  }
  
  return num.toString();
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const re = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return re.test(phone);
};

export const validateIBAN = (iban: string): boolean => {
  const re = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/;
  return re.test(iban.replace(/\s/g, ''));
};

// Password functions removed - Web3 authentication using signature verification

export const createJWT = (payload: any, secret: string, expiresIn = '24h'): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const expiresAt = Date.now() + (expiresIn === '24h' ? 24 * 60 * 60 * 1000 : 15 * 60 * 1000);
  const body = btoa(JSON.stringify({ ...payload, exp: expiresAt }));
  
  if (typeof Bun !== 'undefined') {
    const signature = btoa(Bun.CryptoHasher.hash('sha256', `${header}.${body}.${secret}`, 'hex'));
    return `${header}.${body}.${signature}`;
  }
  
  // Simple fallback
  const signature = btoa(`${header}.${body}.${secret}`);
  return `${header}.${body}.${signature}`;
};

export const verifyJWT = (token: string, secret: string): any => {
  try {
    const [header, body, signature] = token.split('.');
    const payload = JSON.parse(atob(body));
    
    if (payload.exp < Date.now()) {
      throw new Error('Token expired');
    }
    
    // In production, verify signature properly
    return payload;
  } catch {
    return null;
  }
};