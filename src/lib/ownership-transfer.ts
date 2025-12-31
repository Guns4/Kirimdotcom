// Ownership Transfer Service
// Secure company/platform ownership transfer protocol

import crypto from 'node:crypto';

export interface TransferConfig {
  newOwnerEmail: string;
  currentOwnerEmail: string;
  transferPassword: string;
  encryptionKey?: string;
}

export interface SecretRotationResult {
  success: boolean;
  rotatedSecrets: string[];
  newValues: Record<string, string>;
  timestamp: Date;
}

export interface AdminTransferResult {
  success: boolean;
  oldAdmin: string;
  newAdmin: string;
  timestamp: Date;
}

export interface DataExportResult {
  success: boolean;
  filename: string;
  size: number;
  encrypted: boolean;
  checksum: string;
  timestamp: Date;
}

// Generate secure random string
function generateSecureKey(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Generate new API keys and secrets
export function rotateSecrets(): SecretRotationResult {
  const secrets = [
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'API_SECRET_KEY',
    'WEBHOOK_SECRET',
    'SESSION_SECRET',
  ];

  const newValues: Record<string, string> = {};

  secrets.forEach((secret) => {
    newValues[secret] = generateSecureKey(32);
  });

  // In production: Update these in Supabase Dashboard and Vercel env vars
  console.log('=== NEW SECRETS (Store securely!) ===');
  Object.entries(newValues).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });

  return {
    success: true,
    rotatedSecrets: secrets,
    newValues,
    timestamp: new Date(),
  };
}

// Transfer admin privileges
export async function transferAdmin(
  config: TransferConfig
): Promise<AdminTransferResult> {
  // Validate transfer password (should be pre-shared securely)
  // const expectedHash = crypto
  //     .createHash('sha256')
  //     .update(config.transferPassword)
  //     .digest('hex');

  // In production: Verify against stored hash
  // For demo, accept any password

  // Steps to transfer:
  // 1. Set new owner as SUPER_ADMIN
  // 2. Demote current owner to regular USER
  // 3. Invalidate all current owner sessions
  // 4. Send confirmation to both parties

  console.log(
    `Transferring admin from ${config.currentOwnerEmail} to ${config.newOwnerEmail}`
  );

  // In production: Execute Supabase queries
  /*
    await supabase.from('user_roles').upsert({
        email: config.newOwnerEmail,
        role: 'SUPER_ADMIN'
    });

    await supabase.from('user_roles').update({
        role: 'USER'
    }).eq('email', config.currentOwnerEmail);
    */

  return {
    success: true,
    oldAdmin: config.currentOwnerEmail,
    newAdmin: config.newOwnerEmail,
    timestamp: new Date(),
  };
}

// Encrypt data with AES-256
function encryptData(data: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(key, 'hex'),
    iv
  );
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Generate encrypted data export
export async function exportData(
  encryptionKey?: string
): Promise<DataExportResult> {
  const key = encryptionKey || generateSecureKey(16); // 32 hex = 16 bytes = 128 bit

  // In production: Generate actual SQL dump from Supabase
  const mockSqlDump = `
-- CekKirim Database Export
-- Generated: ${new Date().toISOString()}
-- CONFIDENTIAL

-- Users table
CREATE TABLE users (...);
INSERT INTO users VALUES (...);

-- Transactions table
CREATE TABLE transactions (...);
INSERT INTO transactions VALUES (...);

-- Legal documents
CREATE TABLE legal_docs (...);
INSERT INTO legal_docs VALUES (...);
    `;

  const encrypted = encryptData(mockSqlDump, key.padEnd(32, '0').slice(0, 32));
  const checksum = crypto.createHash('sha256').update(encrypted).digest('hex');

  const filename = `cekkkirim_export_${Date.now()}.sql.enc`;

  return {
    success: true,
    filename,
    size: encrypted.length,
    encrypted: true,
    checksum,
    timestamp: new Date(),
  };
}

// Generate transfer checklist
export function getTransferChecklist(): string[] {
  return [
    '✓ Rotate all API keys and secrets',
    '✓ Update Supabase service role key',
    '✓ Change database passwords',
    '✓ Transfer SUPER_ADMIN to new owner',
    '✓ Revoke old owner access tokens',
    '✓ Export encrypted database backup',
    '✓ Transfer domain ownership on registrar',
    '✓ Update billing/payment methods',
    '✓ Transfer Vercel project ownership',
    '✓ Update GitHub repository access',
    '✓ Send legal transfer documents',
    '✓ Notify users of ownership change (optional)',
  ];
}

// Verify transfer completion
export function verifyTransfer(config: TransferConfig): boolean {
  // In production: Run actual verification checks
  // const checks = [
  //     // Check new owner has SUPER_ADMIN
  //     // Check old owner is demoted
  //     // Check secrets are rotated
  //     // Check export is complete
  // ];

  return true; // Demo: always pass
}
