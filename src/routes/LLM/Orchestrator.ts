import type { FastifyInstance } from 'fastify';
import { prisma } from '../../plugins/prisma.js';
import { LLMController } from './LLMController.js';

class ChatOrchestratorClass {
    private llmController!: LLMController;

    init(fastify: FastifyInstance) {
        this.llmController = new LLMController(fastify);
    }

    async processMessage(text: string, clientId: string, customerPhone?: string): Promise<{ response: string; keyword: string }> {
        try {
            const keyword = await this.llmController.identifyProduct(text);
            const normalizedKeyword = keyword?.toUpperCase() === 'NONE' ? '' : (keyword ?? '');

            let response: string;
            let requiresAttention = false;

            if (!normalizedKeyword) {
                console.log(`[Orchestrator] Sin keyword (NONE).`);

                response = await this.llmController.generateChatResponse(
                    text,
                    "SISTEMA: El usuario no está preguntando por un producto específico. Responde amablemente como asistente de ventas, saluda si es necesario y ofrece tu ayuda para buscar productos."
                );

                requiresAttention = true;
            } else {
                console.log(`[Orchestrator] Keyword: ${normalizedKeyword} para Cliente: ${clientId}`);

                const products = await prisma.product.findMany({
                    where: {
                        client_id: clientId,
                        name: { contains: normalizedKeyword, mode: 'insensitive' }
                    },
                    take: 5
                });

                if (products.length === 0) {
                    console.log(`[Orchestrator] Keyword "${normalizedKeyword}" sin stock.`);

                    response = await this.llmController.generateChatResponse(
                        text,
                        `SISTEMA: El producto "${normalizedKeyword}" NO está en el inventario. Informa amablemente que no hay disponibilidad y ofrece buscar otra cosa.`
                    );

                    requiresAttention = true;
                } else {
                    const context = products
                        .map(p => `- ${p.name}: $${p.price} (Stock: ${p.stock})`)
                        .join("\n");

                    console.log(`[Orchestrator] ${products.length} producto(s) encontrado(s).`);

                    response = await this.llmController.generateChatResponse(text, context);
                }
            }

            await prisma.chatLog.create({
                data: {
                    clientId,
                    customerPhone: customerPhone ?? null,
                    userMessage: text,
                    botResponse: response,
                    extractedKeyword: normalizedKeyword || null,
                    requiresAttention,
                }
            });

            return { response, keyword: normalizedKeyword };
        } catch (error) {
            console.error("[Orchestrator Error]:", error);
            const fallback = "Lo siento, tuve un problema al consultar el inventario. Por favor, intenta de nuevo en unos momentos.";

            await prisma.chatLog.create({
                data: {
                    clientId,
                    customerPhone: customerPhone ?? null,
                    userMessage: text,
                    botResponse: fallback,
                    extractedKeyword: null,
                    requiresAttention: true,
                }
            });

            return { response: fallback, keyword: '' };
        }
    }
}

export const ChatOrchestrator = new ChatOrchestratorClass();
