import fastify, { type FastifyInstance } from "fastify";
export class LLMController {
    constructor(private fastify:FastifyInstance){}

    /*async testConnection(){
       try {
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'qwen2.5:1.5b',
            prompt: 'Responde solo con la palabra: ONLINE',
            stream: false
          })
        });

        const data = await response.json() as { response: string };
        return data.response.trim();
        } catch (error) {
          return 'OFFLINE';
        }
    }*/

    async identifyProduct(userMessage: string): Promise<string> {
        const response = await fetch(`${process.env.TEST_ENDPOINT}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.TEST_KEY_GITHUB}`,
            },
            body: JSON.stringify({
                model: `${process.env.TINY_MODEL_NAME_TEST}`,
                messages: [
                    {
                        role: 'system',
                        content: `TU ÚNICA MISIÓN: Extraer el nombre del producto en una sola palabra, minúsculas y singular.
                            PROHIBIDO: Dar precios, descripciones o saludos.
                            Si no hay producto, responde: NONE`
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                temperature: 0,
                max_tokens: 20
            })
        });

        console.log(`\nRespuesta de LLM ${response.statusText} \n`);
        const data = await response.json();

        // CAMBIO AQUÍ: Acceder a la estructura correcta de OpenAI/OpenRouter
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            console.error("No se recibió contenido del LLM", data);
            return "NONE";
        }

        // Ahora sí puedes hacer trim() y replace()
        return content.trim().toLowerCase().replace(/[.,]/g, ''); 
    }

    async generateChatResponse(message: string, context: string) {
        try {
            const systemPrompt = `Eres un asistente de inventario preciso. 
            Tu única fuente de verdad es el CONTEXTO proporcionado.
            REGLAS:
            1. Si el producto está en el contexto, di el NOMBRE, PRECIO y STOCK exactos.
            2. Si el producto NO está en el contexto, di que no hay disponibilidad.
            3. No inventes precios ni digas "precios competitivos".
            4. Responde en máximo 2 oraciones.`;

            const response = await fetch(`${process.env.TEST_ENDPOINT}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.TEST_KEY_GITHUB}`,
                },
                body: JSON.stringify({
                    model: `${process.env.BIG_MODEL_NAME_TEST}`, 
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: `Contexto de inventario:\n${context}\n\nPregunta del cliente: ${message}` }
                    ],
                    temperature: 0.2,
                    max_tokens: 150 
                })
            });

            if (!response.ok) {
                // Leemos el error como texto por si no es un JSON válido
                const errorText = await response.text();
                throw new Error(`LLM Error (${response.status}): ${errorText}`);
            }

            const data = await response.json();

            // Uso de optional chaining (?.) para evitar "Cannot read property of undefined"
            const content = data.choices?.[0]?.message?.content;

            if (!content) {
                return "Lo siento, no encontré información específica en el inventario.";
            }

            return content.trim();

        } catch (error) {
            // Aquí Fastify loguea el error real para que tú lo veas en la consola
            this.fastify.log.error(error);
            // Pero al cliente le damos un mensaje genérico amable
            return "Lo siento, tuve un problema al procesar tu solicitud.";
        }
    }
}