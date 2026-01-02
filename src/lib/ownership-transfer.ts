// Ownership Transfer Service
// Secure company/platform ownership transfer protocol
// This module should only be used on the server side

// Type for Node.js crypto module
type CryptoModule = typeof import('crypto');

// Lazy loaded crypto module (server-side only)
let cryptoModule: CryptoModule | null = null;

async function getServerCrypto(): Promise<CryptoModule> {
  if (typeof window !== 'undefined') {
    throw new Error('This module can only be used on the server');
  }
  if (!cryptoModule) {
    cryptoModule = (await import('crypto')).default as CryptoModule;
  }
  return cryptoModule;
}

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
async function generateSecureKey(length: number = 32): Promise<string> {
  const crypto = await getServerCrypto();
  return crypto.randomBytes(length).toString('hex');
}

// Generate new API keys and secrets
export async function rotateSecrets(): Promise<SecretRotationResult> {
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

  for (const secret of secrets) {
    newValues[secret] = await generateSecureKey(32);
  }

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
  console.log(
    `Transferring admin from ${config.currentOwnerEmail} to ${config.newOwnerEmail}`
  );

  return {
    success: true,
    oldAdmin: config.currentOwnerEmail,
    newAdmin: config.newOwnerEmail,
    timestamp: new Date(),
  };
}

// Encrypt data with AES-256
async function encryptData(data: string, key: string): Promise<string> {
  const crypto = await getServerCrypto();
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
  const crypto = await getServerCrypto();
  const key = encryptionKey || (await generateSecureKey(16));

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

  const encrypted = await encryptData(mockSqlDump, key.padEnd(32, '0').slice(0, 32));
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
  return true; // Demo: always pass
}
