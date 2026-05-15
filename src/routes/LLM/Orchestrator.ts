import type { FastifyInstance } from 'fastify';
import { prisma } from '../../plugins/prisma.js';
import { LLMController } from './LLMController.js';

class ChatOrchestratorClass {
    private llmController!: LLMController;

    init(fastify: FastifyInstance) {
        this.llmController = new LLMController(fastify);
    }

    async processMessage(text: string, clientId: string): Promise<string> {
    try {
        // --- FASE 1: IDENTIFICACIÓN (Modelo Pequeño) ---
        const keyword = await this.llmController.identifyProduct(text);
        
        // Si el modelo detecta que NO es una búsqueda de producto (NONE)
        if (!keyword || keyword.toUpperCase() === 'NONE') {
            console.log(`[Orchestrator] Sin keyword (NONE). Generando respuesta conversacional.`);
            
            /** 
             * Llamamos al cerebro principal pero con contexto vacío.
             * Esto permite que si el usuario dice "Hola", "Gracias" o "¿Como estás?", 
             * el modelo responda humanamente sin intentar vender nada.
             */
            return await this.llmController.generateChatResponse(text, "SISTEMA: El usuario no está preguntando por un producto específico. Responde amablemente como asistente de ventas, saluda si es necesario y ofrece tu ayuda para buscar productos.");
        }

        console.log(`[Orchestrator] Keyword detectada: ${keyword} para Cliente: ${clientId}`);

        // --- FASE 2: BÚSQUEDA (PRISMA) ---
        const products = await prisma.product.findMany({
            where: {
                client_id: clientId, 
                name: { contains: keyword, mode: 'insensitive' }
            },
            take: 5
        });

        // Si la keyword existía pero no hay nada en la DB
        if (products.length === 0) {
            console.log(`[Orchestrator] Keyword "${keyword}" no encontrada en DB. Generando respuesta de no disponibilidad.`);
            
            // Le pedimos al cerebro que redacte la negativa de forma personalizada
            return await this.llmController.generateChatResponse(
                text, 
                `SISTEMA: El producto "${keyword}" NO está en el inventario. Informa amablemente que no hay disponibilidad y ofrece buscar otra cosa.`
            );
        }

        // Formateamos los datos de la DB para el LLM
        const context = products
            .map(p => `- ${p.name}: $${p.price} (Stock: ${p.stock})`)
            .join("\n");

        console.log(`[Orchestrator] Contexto encontrado: ${products.length} productos.`);

        // --- FASE 3: RESULTADO FINAL (Modelo Grande) ---
        return await this.llmController.generateChatResponse(text, context);

    } catch (error) {
        console.error("[Orchestrator Error]:", error);
        return "Lo siento, tuve un problema al consultar el inventario. Por favor, intenta de nuevo en unos momentos.";
    }
}
}

export const ChatOrchestrator = new ChatOrchestratorClass();
