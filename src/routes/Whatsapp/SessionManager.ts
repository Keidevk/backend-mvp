import { WhatsappServices } from './WhatsappServices.js';
import type makeWASocket from '@whiskeysockets/baileys';

// Definimos el tipo del socket para TypeScript
type WASocket = ReturnType<typeof makeWASocket>;

class SessionManager {
    // Mapa para mantener las conexiones activas en memoria
    private activeSessions = new Map<string, WASocket>();
    
    // Instanciamos el servicio de WhatsApp
    private whatsappService = new WhatsappServices();

    async startSession(clientId: string) {
        // Verificamos si ya existe una sesión para evitar duplicados
        if (this.activeSessions.has(clientId)) {
            return { status: 'already_active', message: 'La sesión ya existe para este cliente' };
        }

        try {
            console.log(`[Manager] Iniciando sesión para: ${clientId}`);
            
            // Llamamos al método initSession de la instancia
            const sock = await this.whatsappService.initSession(clientId);
            
            // Guardamos el socket en nuestro mapa
            this.activeSessions.set(clientId, sock);
            
            return { status: 'initializing', message: 'Proceso de vinculación iniciado. Revisa la terminal.' };
        } catch (error) {
            console.error(`[Manager] Error crítico en ${clientId}:`, error);
            throw error;
        }
    }

    // Método para recuperar el socket de un cliente específico
    getSocket(clientId: string): WASocket | undefined {
        return this.activeSessions.get(clientId);
    }

    // Método útil para cerrar sesiones si es necesario
    async stopSession(clientId: string) {
        const sock = this.activeSessions.get(clientId);
        if (sock) {
            await sock.logout();
            this.activeSessions.delete(clientId);
            return true;
        }
        return false;
    }
}

// Exportamos la instancia única (Singleton)
export const sessionManager = new SessionManager();