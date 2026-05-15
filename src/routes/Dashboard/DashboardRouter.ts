import type { FastifyInstance } from "fastify";
import { DashboardController } from "./DashboardController.js";
import { authMiddleware } from "../../middleware/index.js";

export async function DashboardRouter(fastify: FastifyInstance) {
  const controller = new DashboardController(fastify);

  fastify.addHook("preHandler", (request, reply, done) => {
    authMiddleware(request, reply);
    if (reply.sent) return;
    done();
  });

  fastify.post("/bot/activate", async (request, reply) => {
    return controller.activate(request, reply);
  });

  fastify.post("/bot/deactivate", async (request, reply) => {
    return controller.deactivate(request, reply);
  });

  fastify.get("/bot/status", async (request, reply) => {
    return controller.getStatus(request, reply);
  });

  fastify.get("/metrics/messages", async (request, reply) => {
    return controller.getMessagesMetrics(request, reply);
  });

  fastify.get("/metrics/summary", async (request, reply) => {
    return controller.getMetricsSummary(request, reply);
  });

  fastify.get("/logs/:clientId", async (request, reply) => {
    return controller.getLogs(request, reply);
  });

  fastify.patch("/logs/:logId", async (request, reply) => {
    return controller.updateLogAlert(request, reply);
  });
}
