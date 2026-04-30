import type { FastifyRequest, FastifyReply } from 'fastify';
import { sessionManager } from './SessionManager.js';

export const WhatsappController = {
    async startSession(request: FastifyRequest, reply: FastifyReply) {
        // Extraemos el clientId del cuerpo de la petición
        const { clientId } = request.body as { clientId: string };

        // 1. Validación de entrada
        if (!clientId || clientId.trim() === "") {
            return reply.status(400).send({ 
                error: 'Bad Request', 
                message: 'El campo clientId es obligatorio y no puede estar vacío.' 
            });
        }

        try {
            console.log(`[HTTP] Petición recibida para iniciar sesión: ${clientId}`);

            // 2. Llamada al Manager para crear la instancia de Baileys
            const result = await sessionManager.startSession(clientId);

            // 3. Respuesta al cliente (Postman/Frontend)
            // Nota: El QR aparecerá en la terminal de la PC, no en la respuesta HTTP
            return reply.status(200).send({
                success: true,
                message: 'Proceso de vinculación iniciado',
                data: result
            });

        } catch (error) {
            console.error(`[Controller Error] Error al procesar /start para ${clientId}:`, error);

            return reply.status(500).send({ 
                error: 'Internal Server Error', 
                message: 'No se pudo inicializar la sesión de WhatsApp',
                details: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
};