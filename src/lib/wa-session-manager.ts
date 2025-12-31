// import { createClient } from '@/utils/supabase/server';
import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    AuthenticationCreds
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import QRCode from 'qrcode';
import pino from 'pino';

// Since we can't easily implement a full Supabase Auth State in one go without a complex library,
// we will stick to a simplified approach for this MVP:
// 1. We will NOT persist to DB in this specific code block to avoid complexity overload (Baileys auth state logic is verbose).
// 2. We will use 'useMultiFileAuthState' which saves to local file system './wa-sessions'.
// 3. For Production, one would implement a custom AuthState that reads/writes to Supabase.
//    However, I will add a placeholder structure that suggests where the DB integration goes.

const logger = pino({ level: 'silent' });

export const WASessionManager = {
    async createSession(userId: string) {
        // Ensure this runs in Node.js environment

        // Setup local storage for sessions (MVP)
        // Ideally this path should be writable
        const sessionPath = `./.wa-sessions/${userId}`;
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const { version } = await fetchLatestBaileysVersion();

        const sock = makeWASocket({
            version,
            logger,
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            // browser: ['Kirim.Com Bot', 'Chrome', '1.0.0'],
        });

        return new Promise<{ qr?: string; status: string }>((resolve, reject) => {
            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    try {
                        const qrDataURL = await QRCode.toDataURL(qr);
                        resolve({ qr: qrDataURL, status: 'scan_needed' });
                    } catch (e) {
                        reject(e);
                    }
                }

                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                    // Auto reconnect logic would go here
                    if (shouldReconnect) {
                        // reconnect logic
                    }
                    if ((lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.loggedOut) {
                        // clean up session
                    }
                } else if (connection === 'open') {
                    resolve({ status: 'connected' });
                }
            });

            sock.ev.on('creds.update', saveCreds);

            // Timeout if no event
            setTimeout(() => {
                resolve({ status: 'timeout' }); // Should handle better
            }, 10000);
        });
    },

    async checkSessionStatus(userId: string) {
        // Check if session exists (simplified)
        // In real app, we check connection state stored in DB or memory
        return { status: 'unknown' };
    }
};
