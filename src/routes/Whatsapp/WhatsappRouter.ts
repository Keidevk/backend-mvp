import type { FastifyInstance } from 'fastify';
import { sessionManager } from './SessionManager.js';
import { WhatsappController } from './WhatsappController.js';

interface StartSessionBody {
    clientId: string;
}

export async function whatsappRouter(fastify: FastifyInstance) {

    fastify.post<{ Body: StartSessionBody }>('/start', WhatsappController.startSession);

    fastify.get('/qr/:clientId', WhatsappController.getQR);

    fastify.get('/health', async () => {
        return { status: 'online', service: 'whatsapp-manager' };
    });

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
