import { type FastifyInstance } from "fastify";
export class LLMController {
    constructor(private fastify:FastifyInstance){}

    async testConnection(): Promise<string> {
        try {
            const response = await fetch(`${process.env.TEST_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.TEST_KEY_GITHUB}`,
                },
                body: JSON.stringify({
                    model: `${process.env.TINY_MODEL_NAME_TEST}`,
                    messages: [
                        { role: 'user', content: 'Responde solo con la palabra: ONLINE' }
                    ],
                    temperature: 0,
                    max_tokens: 10
                })
            });

            if (!response.ok) return 'OFFLINE';

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            return content?.trim().includes('ONLINE') ? 'ONLINE' : 'OFFLINE';
        } catch {
            return 'OFFLINE';
        }
    }

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
                        content: `Eres un extractor de términos de búsqueda. El usuario está preguntando por un producto o servicio que quiere comprar.

Tu ÚNICA tarea es extraer la palabra clave principal (sustantivo) de lo que busca.

REGLAS:
- Extrae SOLO el sustantivo principal (lo que quiere comprar/buscar)
- Una sola palabra, minúsculas, singular
- Detecta CUALQUIER cosa: medicamentos, ropa, comida, servicios, electrónicos, etc.
- No importa si existe o no en el inventario, tu trabajo es extraer la intención
- Ignora: saludos, precios, cantidades, colores, tallas

Si NO hay un producto/servicio en el mensaje → responde "NONE"

EJEMPLOS:
"Tienen paracetamol?" → paracetamol
"Busco una camiseta roja" → camiseta
"Venden pizza?" → pizza
"Necesito un celular nuevo" → celular
"Hola, buenos días" → NONE
"¿Cuánto cuesta el ibuprofeno?" → ibuprofeno
"Quiero dos mochilas" → mochila
"¿A qué hora abren?" → NONE
"Dame información sobre tu servicio de delivery" → delivery
"Tienen control remoto universal?" → control`
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
            const systemPrompt = `Eres un asistente de inventario. No eres un vendedor. No das consejos. No negocias.

REGLAS OBLIGATORIAS:
1. Producto EN contexto → responder SOLO: "[NOMBRE] - $[PRECIO] - Stock: [STOCK]"
2. Producto NO en contexto → responder SOLO: "No tenemos [PRODUCTO]"
3. PROHIBIDO: "precios competitivos", "consulta después", "puede llegar", "normalmente"
4. PROHIBIDO: inventar números, aproximaciones, o rangos de precio
5. Máximo 2 oraciones

Si la información no está en el contexto, NO LA INVENTES.`;

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