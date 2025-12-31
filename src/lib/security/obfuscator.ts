/**
 * Simple client-side obfuscation to prevent "strings" grep on built JS.
 * Not military grade, but stops script kiddies.
 * Use environment variables for real secrets on the server!
 */

// Base64 helper
const b64 = (str: string) => typeof window !== 'undefined' ? window.btoa(str) : Buffer.from(str).toString('base64');
const db64 = (str: string) => typeof window !== 'undefined' ? window.atob(str) : Buffer.from(str, 'base64').toString('utf-8');

// Simple XOR Cipher
const secretKey = 'LIGUNS_SECURE_KEY_X99';

export const Obfuscator = {
    /**
     * Encrypt a sensitive string (e.g. API Keys)
     * Run this locally to generate the safe string to put in code.
     */
    encrypt: (text: string): string => {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length));
        }
        return b64(result);
    },

    /**
     * Decrypt at runtime
     */
    decrypt: (cipher: string): string => {
        try {
            const text = db64(cipher);
            let result = '';
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(text.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length));
            }
            return result;
        } catch (e) {
            console.error('Decryption failed');
            return '';
        }
    }
};
