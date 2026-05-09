import Fastify from "fastify";
import { ProductoRouter } from "./routes/Productos/ProductRouter.js"; 
import { LLMRouter } from "./routes/LLM/LLMRouter.js";
import { whatsappRouter } from "./routes/Whatsapp/WhatsappRouter.js"; // Importamos el router de WhatsApp
import { ChatOrchestrator } from "./routes/LLM/Orchestrator.js"; // Importamos el Orquestador
import { prisma } from './pluggins/prisma.js';

const fastify = Fastify({
  logger: true,
});

// --- INICIALIZACIÓN DE IA ---
// Es vital hacerlo antes de registrar las rutas para que el controlador 
// de LLM tenga la instancia de Fastify lista para las peticiones a Ollama.
ChatOrchestrator.init(fastify);

// --- REGISTRO DE RUTAS ---
fastify.register(ProductoRouter, { prefix: "api/productos" });
fastify.register(LLMRouter, { prefix: 'api/llm' });
fastify.register(whatsappRouter, { prefix: 'api/whatsapp' }); // Registramos el servicio de WhatsApp

const start = async () => {
  try {
    // Conexión a la base de datos
    await prisma.$connect();
    console.log("✅ Conexión con PostgreSQL (Docker) exitosa");

    // Inicio del servidor
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("🚀 Servidor multi-agente corriendo en http://localhost:3000");
    
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();