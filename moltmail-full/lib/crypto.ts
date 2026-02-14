/**
 * Encryption utilities for MoltMail
 * Uses Web Crypto API for AES-GCM encryption
 */

export interface EncryptedEmail {
  encryptedContent: string;
  encryptedKey: string;
  iv: string;
  emailHash: string;
}

// Generate a new RSA key pair
export async function generateKeyPair(): Promise<CryptoKeyPair> {
  if (typeof window === 'undefined') throw new Error('Crypto only available in browser');
  return await window.crypto.subtle.generateKey(
    { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['encrypt', 'decrypt']
  );
}

// Export public key as base64
export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('spki', publicKey);
  return arrayBufferToBase64(exported);
}

// Export private key as base64
export async function exportPrivateKey(privateKey: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('pkcs8', privateKey);
  return arrayBufferToBase64(exported);
}

// Import public key from base64
export async function importPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
  const publicKeyBuffer = base64ToArrayBuffer(publicKeyBase64);
  return await window.crypto.subtle.importKey('spki', publicKeyBuffer, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
}

// Import private key from base64
export async function importPrivateKey(privateKeyBase64: string): Promise<CryptoKey> {
  const privateKeyBuffer = base64ToArrayBuffer(privateKeyBase64);
  return await window.crypto.subtle.importKey('pkcs8', privateKeyBuffer, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt']);
}

// Encrypt email content
export async function encryptEmail(content: string, recipientPublicKeyBase64: string): Promise<EncryptedEmail> {
  const aesKey = await window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const contentBuffer = new TextEncoder().encode(content);
  const encryptedContentBuffer = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, contentBuffer);
  const exportedAESKey = await window.crypto.subtle.exportKey('raw', aesKey);
  const recipientPublicKey = await importPublicKey(recipientPublicKeyBase64);
  const encryptedKeyBuffer = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, recipientPublicKey, exportedAESKey);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', encryptedContentBuffer);
  const emailHash = arrayBufferToHex(hashBuffer);

  return {
    encryptedContent: arrayBufferToBase64(encryptedContentBuffer),
    encryptedKey: arrayBufferToBase64(encryptedKeyBuffer),
    iv: arrayBufferToBase64(iv.buffer),
    emailHash: '0x' + emailHash,
  };
}

// Decrypt email content
export async function decryptEmail(encryptedContentBase64: string, encryptedKeyBase64: string, ivBase64: string, recipientPrivateKeyBase64: string): Promise<string> {
  const encryptedKeyBuffer = base64ToArrayBuffer(encryptedKeyBase64);
  const recipientPrivateKey = await importPrivateKey(recipientPrivateKeyBase64);
  const aesKeyBuffer = await window.crypto.subtle.decrypt({ name: 'RSA-OAEP' }, recipientPrivateKey, encryptedKeyBuffer);
  const aesKey = await window.crypto.subtle.importKey('raw', aesKeyBuffer, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const encryptedContentBuffer = base64ToArrayBuffer(encryptedContentBase64);
  const iv = base64ToArrayBuffer(ivBase64);
  const decryptedBuffer = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(iv) }, aesKey, encryptedContentBuffer);
  return new TextDecoder().decode(decryptedBuffer);
}

// Helper functions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Local storage helpers
const PRIVATE_KEY_STORAGE_KEY = 'mmail_private_key';
const PUBLIC_KEY_STORAGE_KEY = 'mmail_public_key';

export function saveKeysToStorage(publicKey: string, privateKey: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PUBLIC_KEY_STORAGE_KEY, publicKey);
  localStorage.setItem(PRIVATE_KEY_STORAGE_KEY, privateKey);
}

export function loadKeysFromStorage(): { publicKey: string | null; privateKey: string | null } {
  if (typeof window === 'undefined') return { publicKey: null, privateKey: null };
  return {
    publicKey: localStorage.getItem(PUBLIC_KEY_STORAGE_KEY),
    privateKey: localStorage.getItem(PRIVATE_KEY_STORAGE_KEY),
  };
}
