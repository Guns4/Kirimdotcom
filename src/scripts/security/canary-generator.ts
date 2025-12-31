import fs from 'fs';
import path from 'path';

/**
 * CANARY GENERATOR
 * Run this to plant traps in your codebase.
 */

const TRAPS = {
    envFile: true,
    sqlUser: true
};

function generateTraps() {
    console.log('🏗️  Planting Security Traps...');

    // 1. Fake .env Backup
    // This looks like a juicy target for hackers looking for credentials
    if (TRAPS.envFile) {
        const dest = path.join(process.cwd(), '.env.backup');
        const content = `
# BACKUP CREDENTIALS (DO NOT DELETE)
# Last Updated: 2024-12-01

DB_PASSWORD=live_prod_x829392
AWS_ACCESS_KEY=AKIA_FAKE_KEY_DO_NOT_USE
# WARNING: OPENING THIS URL TRIGGERS AN ALERT
CANARY_URL=http://canarytokens.com/stats/about/feed/7f8f903a28c7/index.html
        `.trim();

        // Note: The URL above is a placeholder. You must generate a real one at canarytokens.org
        // Type: "Web Bug" or "DNS Token"

        fs.writeFileSync(dest, content);
        console.log('✅ planted .env.backup');
    }

    // 2. Fake Database User (SQL Script)
    // You must execute this SQL in your DB.
    if (TRAPS.sqlUser) {
        const dest = path.join(process.cwd(), 'supabase/security/trap_user.sql');
        const content = `
-- HONEYTOKEN USER
-- If anyone tries to login as this user, trigger an alert (via Database Webhook or simply Log monitoring)

INSERT INTO auth.users (id, email, encrypted_password)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'admin_root@cekkirim.com', 'hashed_fake_password_123');
  
-- Setup a trigger (advanced) or just monitor your logs for failed logins to this email.
        `.trim();

        // Ensure dir exists
        const dir = path.dirname(dest);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(dest, content);
        console.log('✅ generated supabase/security/trap_user.sql');
    }

    console.log('⚠️  IMPORTANT: Replace placeholder URLs with REAL Canary Tokens from canarytokens.org');
}

generateTraps();
