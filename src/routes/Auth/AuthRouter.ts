import type { FastifyInstance } from "fastify";
import { AuthController } from "./AuthController.js";

export async function AuthRouter(fastify: FastifyInstance) {
  const controller = new AuthController(fastify);

  fastify.post("/register", async (request, reply) => {
    return controller.register(request, reply);
  });

  fastify.post("/login", async (request, reply) => {
    return controller.login(request, reply);
  });

  fastify.get("/me", async (request, reply) => {
    return controller.getMe(request, reply);
  });

  fastify.post("/logout", async (request, reply) => {
    return controller.logout(request, reply);
  });
}