import type { FastifyInstance } from "fastify";
import { LLMController } from "./LLMController.js";
import { ChatOrchestrator } from "./Orchestrator.js";

export async function LLMRouter(fastify: FastifyInstance) {
  const LLMService = new LLMController(fastify)

  fastify.get('/ai-status', async (request, reply) => {
    const status = await LLMService.testConnection();

    if (status.includes("ONLINE")) {
      return { status: 'ok', message: 'El LLM está conectado correctamente' };
    } else {
      return reply.code(500).send({ status: 'error', message: 'No se pudo conectar con el LLM' });
    }
  });

  fastify.post('/chat', async (request, reply) => {
    const { message, clientId, customerPhone } = request.body as { message: string; clientId: string; customerPhone?: string };

    const { response } = await ChatOrchestrator.processMessage(message, clientId, customerPhone);

    return { response };
  });
}
