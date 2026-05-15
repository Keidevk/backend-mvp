import Fastify from "fastify";
import cors from "@fastify/cors";
import { ProductoRouter } from "./routes/Productos/ProductRouter.js"; 
import { LLMRouter } from "./routes/LLM/LLMRouter.js";
import { whatsappRouter } from "./routes/Whatsapp/WhatsappRouter.js"; // Importamos el router de WhatsApp
import { AuthRouter } from "./routes/Auth/AuthRouter.js"; // Importamos el router de Auth
import { DashboardRouter } from "./routes/Dashboard/DashboardRouter.js";
import { ChatOrchestrator } from "./routes/LLM/Orchestrator.js"; // Importamos el Orquestador
import { prisma } from './pluggins/prisma.js';

const fastify = Fastify({
  logger: true,
});

// --- CORS ---
fastify.register(cors, {
  origin: ["http://localhost:4321"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
});

// --- INICIALIZACIÓN DE IA ---
ChatOrchestrator.init(fastify);

// --- REGISTRO DE RUTAS ---
fastify.register(ProductoRouter, { prefix: "api/productos" });
fastify.register(LLMRouter, { prefix: 'api/llm' });
fastify.register(whatsappRouter, { prefix: 'api/whatsapp' }); // Registramos el servicio de WhatsApp
fastify.register(AuthRouter, { prefix: 'api/auth' }); // Registramos el router de autenticación
fastify.register(DashboardRouter, { prefix: 'api/dashboard' });

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