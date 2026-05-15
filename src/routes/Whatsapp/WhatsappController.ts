import type { FastifyRequest, FastifyReply } from 'fastify';
import { sessionManager } from './SessionManager.js';

export const WhatsappController = {
    async startSession(request: FastifyRequest, reply: FastifyReply) {
        const { clientId } = request.body as { clientId: string };

        if (!clientId || clientId.trim() === "") {
            return reply.status(400).send({
                error: 'Bad Request',
                message: 'El campo clientId es obligatorio y no puede estar vacío.'
            });
        }

        try {
            console.log(`[HTTP] Petición recibida para iniciar sesión: ${clientId}`);

            const result = await sessionManager.startSession(clientId);

            return reply.status(200).send({
                success: true,
                message: 'Proceso de vinculación iniciado',
                data: {
                    sessionId: clientId,
                    qrCode: result.qrCode,
                }
            });

        } catch (error) {
            console.error(`[Controller Error] Error al procesar /start para ${clientId}:`, error);

            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'No se pudo inicializar la sesión de WhatsApp',
                details: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    },

    async getQR(request: FastifyRequest, reply: FastifyReply) {
        const { clientId } = request.params as { clientId: string };

        if (!clientId) {
            return reply.status(400).send({ error: 'clientId es requerido' });
        }

        try {
            const qrCode = sessionManager.getQR(clientId);

            return reply.send({
                success: true,
                data: { qrCode }
            });
        } catch (error) {
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Error al obtener el QR',
            });
        }
    }
};
