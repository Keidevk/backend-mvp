import type { FastifyInstance } from 'fastify';
import { sessionManager } from './SessionManager.js';
import { WhatsappController } from './WhatsappController.js';

// Definimos la interfaz aquí para que el Router sepa qué esperar en el Body
interface StartSessionBody {
    clientId: string;
}

export async function whatsappRouter(fastify: FastifyInstance) {
    
    // Iniciar sesión (Llamamos directamente al método del controlador)
    fastify.post<{ Body: StartSessionBody }>('/start', WhatsappController.startSession);

    // Estado general del servicio
    fastify.get('/health', async () => {
        return { status: 'online', service: 'whatsapp-manager' };
    });

    // Estado de una sesión específica por ID
    fastify.get('/status/:clientId', async (request, reply) => {
        const { clientId } = request.params as { clientId: string };
        const socket = sessionManager.getSocket(clientId);
        
        return reply.send({ 
            clientId, 
            active: !!socket,
            state: !!socket ? 'connected' : 'disconnected'
        });
    });
}