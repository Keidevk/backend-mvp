import { WhatsappServices } from './WhatsappServices.js';
import type makeWASocket from '@whiskeysockets/baileys';

type WASocket = ReturnType<typeof makeWASocket>;

interface SessionCallbacks {
    onQR?: (qr: string) => void;
    onConnected?: (clientId: string) => void;
}

class SessionManager {
    private activeSessions = new Map<string, WASocket>();
    private qrCodes = new Map<string, string | null>();
    private sessionCallbacks = new Map<string, SessionCallbacks>();
    private whatsappService = new WhatsappServices();

    async startSession(clientId: string, callbacks?: SessionCallbacks) {
        if (this.activeSessions.has(clientId)) {
            const existingQr = this.qrCodes.get(clientId) ?? null;
            return { status: 'already_active', message: 'La sesión ya existe para este cliente', qrCode: existingQr };
        }

        try {
            console.log(`[Manager] Iniciando sesión para: ${clientId}`);

            if (callbacks) {
                this.sessionCallbacks.set(clientId, callbacks);
            }

            const mergedCallbacks: SessionCallbacks = {
                onQR: (qr) => {
                    if (qr) {
                        this.qrCodes.set(clientId, qr);
                    } else {
                        this.qrCodes.set(clientId, null);
                    }
                    this.sessionCallbacks.get(clientId)?.onQR?.(qr);
                },
                onConnected: (id) => {
                    this.sessionCallbacks.get(clientId)?.onConnected?.(id);
                },
            };

            const sock = await this.whatsappService.initSession(clientId, mergedCallbacks);

            this.activeSessions.set(clientId, sock);

            const qrCode = this.qrCodes.get(clientId) ?? null;

            return { status: 'initializing', message: 'Proceso de vinculación iniciado', qrCode };
        } catch (error) {
            console.error(`[Manager] Error crítico en ${clientId}:`, error);
            throw error;
        }
    }

    getQR(clientId: string): string | null {
        return this.qrCodes.get(clientId) ?? null;
    }

    getSocket(clientId: string): WASocket | undefined {
        return this.activeSessions.get(clientId);
    }
}

export const sessionManager = new SessionManager();
