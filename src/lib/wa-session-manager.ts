// WhatsApp Session Manager
// Multi-device session management with Baileys

import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    WASocket,
    ConnectionState
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import QRCode from 'qrcode';
import pino from 'pino';
import path from 'path';
import fs from 'fs';

export interface WASession {
    sessionId: string;
    userId: string;
    status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'QR_READY';
    qrCode?: string;
    phoneNumber?: string;
    socket?: WASocket;
}

// Active sessions store (in-memory, use Redis in production)
const activeSessions = new Map<string, WASession>();

// Sessions directory
const SESSIONS_DIR = path.join(process.cwd(), '.wa-sessions');

// Ensure sessions directory exists
if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// Logger
const logger = pino({ level: 'silent' });

// Generate unique session ID
export function generateSessionId(userId: string): string {
    return `wa_${userId}_${Date.now()}`;
}

// Get session path
function getSessionPath(sessionId: string): string {
    return path.join(SESSIONS_DIR, sessionId);
}

// Create new WA connection
export async function createWASession(
    sessionId: string,
    userId: string,
    onQR: (qr: string) => void,
    onConnected: (phoneNumber: string) => void,
    onDisconnected: (reason: string) => void
): Promise<WASession> {
    const sessionPath = getSessionPath(sessionId);

    // Initialize auth state
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    // Create socket
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger,
        browser: ['CekKirim Bot', 'Chrome', '120.0.0'],
    });

    const session: WASession = {
        sessionId,
        userId,
        status: 'CONNECTING',
        socket: sock
    };

    activeSessions.set(sessionId, session);

    // Connection update handler
    sock.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            // Generate QR code as data URL
            const qrDataUrl = await QRCode.toDataURL(qr);
            session.qrCode = qrDataUrl;
            session.status = 'QR_READY';
            onQR(qrDataUrl);
        }

        if (connection === 'close') {
            const shouldReconnect =
                (lastDisconnect?.error as Boom)?.output?.statusCode !==
                DisconnectReason.loggedOut;

            session.status = 'DISCONNECTED';
            onDisconnected(
                shouldReconnect ? 'Connection lost, reconnecting...' : 'Logged out'
            );

            if (shouldReconnect) {
                // Reconnect after delay
                setTimeout(() => {
                    createWASession(sessionId, userId, onQR, onConnected, onDisconnected);
                }, 5000);
            } else {
                // Clean up session files
                deleteSession(sessionId);
            }
        }

        if (connection === 'open') {
            session.status = 'CONNECTED';
            session.phoneNumber = sock.user?.id?.split(':')[0];
            session.qrCode = undefined;
            onConnected(session.phoneNumber || 'Unknown');
        }
    });

    // Save credentials on update
    sock.ev.on('creds.update', saveCreds);

    return session;
}

// Get active session
export function getSession(sessionId: string): WASession | undefined {
    return activeSessions.get(sessionId);
}

// Get all sessions for user
export function getUserSessions(userId: string): WASession[] {
    return Array.from(activeSessions.values())
        .filter(s => s.userId === userId);
}

// Delete session
export function deleteSession(sessionId: string): boolean {
    const session = activeSessions.get(sessionId);

    if (session?.socket) {
        session.socket.logout();
    }

    activeSessions.delete(sessionId);

    // Remove session files
    const sessionPath = getSessionPath(sessionId);
    if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true });
    }

    return true;
}

// Send message
export async function sendMessage(
    sessionId: string,
    to: string,
    message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const session = activeSessions.get(sessionId);

    if (!session?.socket || session.status !== 'CONNECTED') {
        return { success: false, error: 'Session not connected' };
    }

    try {
        // Format phone number
        const jid = to.includes('@s.whatsapp.net')
            ? to
            : `${to.replace(/\D/g, '')}@s.whatsapp.net`;

        const result = await session.socket.sendMessage(jid, { text: message });

        return {
            success: true,
            messageId: result?.key?.id
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Check if number is on WhatsApp
export async function checkNumber(
    sessionId: string,
    phoneNumber: string
): Promise<boolean> {
    const session = activeSessions.get(sessionId);

    if (!session?.socket || session.status !== 'CONNECTED') {
        return false;
    }

    try {
        const jid = `${phoneNumber.replace(/\D/g, '')}@s.whatsapp.net`;
        const [result] = await session.socket.onWhatsApp(jid);
        return result?.exists ?? false;
    } catch {
        return false;
    }
}

// Get session status
export function getSessionStatus(sessionId: string): {
    status: string;
    qrCode?: string;
    phoneNumber?: string;
} {
    const session = activeSessions.get(sessionId);

    if (!session) {
        return { status: 'NOT_FOUND' };
    }

    return {
        status: session.status,
        qrCode: session.qrCode,
        phoneNumber: session.phoneNumber
    };
}
