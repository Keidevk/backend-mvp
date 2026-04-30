import makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    proto 
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import QRCode from 'qrcode'
import { ChatOrchestrator } from '../LLM/Orchestrator.js';

export class WhatsappServices {

    async initSession(clientId: string) {
        // Usamos la carpeta /sessions definida en tu estructura
        const { state, saveCreds } = await useMultiFileAuthState(`./sessions/session_${clientId}`);
        const { version } = await fetchLatestBaileysVersion();

        const sock = makeWASocket({
            version,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
            },
            // printQRInTerminal: true, // Eliminado por estar deprecated
            logger: pino({ level: 'silent' }),
        });

        // Guardar credenciales cuando se actualicen
        sock.ev.on('creds.update', saveCreds);

        // Manejo de conexión y generación de QR
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;

            // Renderizado manual del QR en la terminal
            if (qr) {
                console.log(`\n[${clientId}] QR GENERADO:`);
                QRCode.toString(qr,{type:'terminal'}, (err, url) => {
                    if (err) {
                        console.error(`[${clientId}] Error al generar QR:`, err);
                    } else {
                        console.log(url);
                    }
                });
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    console.log(`[${clientId}] Conexión cerrada, reintentando...`);
                    this.initSession(clientId);
                }
            } else if (connection === 'open') {
                console.log(`[${clientId}] ✅ Conectado exitosamente`);
            }
        });

        // Listener de mensajes entrantes
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;

            const msg: proto.IWebMessageInfo | undefined = messages[0];
            
            // Validaciones de seguridad y contenido
            if (!msg || !msg.message || !msg.key || msg.key.fromMe) return;

            const jid = msg.key.remoteJid;
            if (!jid) return;

            // Extracción de texto multiformato
            const text = msg.message.conversation || 
                         msg.message.extendedTextMessage?.text || 
                         msg.message.imageMessage?.caption || 
                         "";

            if (!text) return;

            console.log(`[${clientId}] Mensaje de ${jid}: ${text}`);

            try {
                // Enviamos el mensaje al Orquestador (Singleton inicializado en server.ts)
                const response = await ChatOrchestrator.processMessage(text, clientId);

                // Enviamos la respuesta procesada por la IA
                await sock.sendMessage(jid, { text: response });
                
            } catch (error) {
                console.error(`[Error WhatsApp] Fallo en ${clientId}:`, error);
                await sock.sendMessage(jid, { 
                    text: "Lo siento, tuve un inconveniente técnico. Por favor, intenta de nuevo." 
                });
            }
        });

        return sock;
    }
}