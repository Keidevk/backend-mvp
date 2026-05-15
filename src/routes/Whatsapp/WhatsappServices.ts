import makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    proto 
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { prisma } from '../../plugins/prisma.js';
import { ChatOrchestrator } from '../LLM/Orchestrator.js';

interface SessionCallbacks {
    onQR?: (qr: string) => void;
    onConnected?: (clientId: string) => void;
}

export class WhatsappServices {

    async initSession(clientId: string, callbacks?: SessionCallbacks) {
        const { state, saveCreds } = await useMultiFileAuthState(`./sessions/session_${clientId}`);
        const { version } = await fetchLatestBaileysVersion();

        const sock = makeWASocket({
            version,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
            },
            logger: pino({ level: 'silent' }),
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                callbacks?.onQR?.(qr);
                console.log(`[${clientId}] ✅ QR enviado al frontend`);
            }

            if (connection === 'close') {
                const error = lastDisconnect?.error;
                const shouldReconnect = !(error instanceof Boom) || error.output.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    console.log(`[${clientId}] Conexión cerrada, reintentando...`);
                    this.initSession(clientId, callbacks);
                }
            } else if (connection === 'open') {
                console.log(`[${clientId}] ✅ Conectado exitosamente`);
                callbacks?.onConnected?.(clientId);
                callbacks?.onQR?.("");
            }
        });

        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;

            const msg: proto.IWebMessageInfo | undefined = messages[0];
            
            if (!msg || !msg.message || !msg.key || msg.key.fromMe) return;

            const jid = msg.key.remoteJid;
            if (!jid) return;

            const text = msg.message.conversation || 
                         msg.message.extendedTextMessage?.text || 
                         msg.message.imageMessage?.caption || 
                         "";

            if (!text) return;

            console.log(`[${clientId}] Mensaje de ${jid}: ${text}`);

            try {
                await prisma.user.update({ where: { clientId }, data: { messageCredits: { increment: 1 } } });

                const response = await ChatOrchestrator.processMessage(text, clientId);

                await sock.sendMessage(jid, { text: response });
                await prisma.user.update({ where: { clientId }, data: { messageCredits: { increment: 1 } } });
                
            } catch (error) {
                console.error(`[Error WhatsApp] Fallo en ${clientId}:`, error);
                try {
                    await sock.sendMessage(jid, {
                        text: "Lo siento, tuve un inconveniente técnico. Por favor, intenta de nuevo."
                    });
                } catch { }
            }
        });

        return sock;
    }
}
