import type { FastifyInstance } from "fastify";
import { LLMController } from "./LLMController.js";
import { prisma } from "../../pluggins/prisma.js";

export async function LLMRouter(fastify: FastifyInstance) {
  const LLMService = new LLMController(fastify)

  //LLM Status
  fastify.get('/ai-status', async (request, reply) => {
    const status = await LLMService.testConnection();

    if (status.includes("ONLINE")) {
      return { status: 'ok', message: 'El LLM está conectado correctamente' };
    } else {
      return reply.code(500).send({ status: 'error', message: 'No se pudo conectar con Ollama' });
    }
  });

  // Endpoint para recibir mensajes
  fastify.post('/chat', async (request, reply) => {
    const { message, clientId } = request.body as { message: string, clientId: string };

    // --- FASE 1: IDENTIFICACIÓN (0.5b) ---
    const keyword = await LLMService.identifyProduct(message);
      
    if (keyword === 'NONE') {
        return { response: "Lo siento, ¿podrías decirme qué producto buscas?" };
    }
    console.log(keyword)

    // --- FASE 2: BÚSQUEDA (PRISMA) ---
    const products = await prisma.product.findMany({
        where: {
            client_id: clientId,
            name: { contains: keyword, mode: 'insensitive' }
        },
        take: 5
    });

    // Convertimos los productos encontrados en un string corto
    const context = products.map(p => `${p.name}: $${p.price} (Stock: ${p.stock})`).join(", ");
    console.log("DATOS ENVIADOS AL LLM:", context);


    // --- FASE 3: RESULTADO (1.5b) ---
    // Aquí usamos el método que ya tenías para generar la respuesta amigable
    const finalResponse = await LLMService.generateChatResponse(message, context);

    return { 
        extracted_keyword: keyword, // Útil para debugear
        response: finalResponse 
    };
  });
    
}