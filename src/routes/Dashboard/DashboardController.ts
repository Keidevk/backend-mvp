import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { DashboardServices } from "./DashboardServices.js";
import { sessionManager } from "../Whatsapp/SessionManager.js";
import { prisma } from "../../pluggins/prisma.js";

export class DashboardController {
  constructor(private fastify: FastifyInstance) {}

  async activate(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    if (!userId) {
      return reply.code(401).send({ error: "Usuario no autenticado" });
    }

    const user = await DashboardServices.getUserById(userId);
    if (!user) {
      return reply.code(404).send({ error: "Usuario no encontrado" });
    }

    const bot = await DashboardServices.getOrCreateBot(userId);

    try {
      const session = await sessionManager.startSession(user.clientId, {
        onConnected: async (id) => {
          await DashboardServices.updateBotStatus(userId, {
            isActive: true,
            whatsappSessionId: id,
            connectedAt: new Date(),
            disconnectedAt: null,
          });
        },
      });

      await DashboardServices.updateBotStatus(userId, {
        isActive: true,
      });

      return reply.send({
        success: true,
        message: "Bot activado correctamente",
        data: {
          qrCode: session.qrCode,
        },
      });
    } catch (error) {
      return reply.code(500).send({
        error: "Error al iniciar la sesión de WhatsApp",
      });
    }
  }

  async deactivate(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    if (!userId) {
      return reply.code(401).send({ error: "Usuario no autenticado" });
    }

    const bot = await DashboardServices.getBotByUserId(userId);
    if (!bot) {
      return reply.code(404).send({ error: "Bot no encontrado" });
    }

    await DashboardServices.updateBotStatus(userId, {
      isActive: false,
      connectedAt: bot.connectedAt,
      disconnectedAt: new Date(),
    });

    return reply.send({
      success: true,
      message: "Bot desactivado correctamente",
    });
  }

  async getStatus(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    if (!userId) {
      return reply.code(401).send({ error: "Usuario no autenticado" });
    }

    const bot = await DashboardServices.getBotByUserId(userId);
    if (!bot) {
      return reply.code(404).send({ error: "Bot no encontrado" });
    }

    return reply.send({
      success: true,
      data: {
        isActive: bot.isActive,
        whatsappSessionId: bot.whatsappSessionId,
        connectedAt: bot.connectedAt,
        disconnectedAt: bot.disconnectedAt,
      },
    });
  }

  async getMessagesMetrics(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    if (!userId) {
      return reply.code(401).send({ error: "Usuario no autenticado" });
    }

    const bot = await DashboardServices.getBotByUserId(userId);
    if (!bot) {
      return reply.code(404).send({ error: "Bot no encontrado" });
    }

    const { from, to } = request.query as { from?: string; to?: string };

    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    const [counts, timeline] = await Promise.all([
      DashboardServices.getMessagesCountByBotId(bot.id, fromDate, toDate),
      DashboardServices.getMessageTimeline(bot.id, fromDate, toDate),
    ]);

    return reply.send({
      success: true,
      data: {
        total: counts.total,
        incoming: counts.incoming,
        outgoing: counts.outgoing,
        timeline,
      },
    });
  }

  async getMetricsSummary(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    if (!userId) {
      return reply.code(401).send({ error: "Usuario no autenticado" });
    }

    const bot = await DashboardServices.getBotByUserId(userId);
    if (!bot) {
      return reply.code(404).send({ error: "Bot no encontrado" });
    }

    const counts = await DashboardServices.getMessagesCountByBotId(bot.id);
    const lastMessage = await DashboardServices.getLastMessageByBotId(bot.id);

    const firstMessage = await prisma.message.findFirst({
      where: { botId: bot.id },
      orderBy: { sentAt: "asc" },
      select: { sentAt: true },
    });

    let averageDailyMessages = 0;
    if (firstMessage && lastMessage) {
      const diffTime = Math.abs(
        lastMessage.sentAt.getTime() - firstMessage.sentAt.getTime()
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      averageDailyMessages = Math.round(counts.total / diffDays);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { messageCredits: true },
    });

    return reply.send({
      success: true,
      data: {
        totalMessages: counts.total,
        messageCredits: user?.messageCredits ?? 0,
        isBotActive: bot.isActive,
        lastMessageAt: lastMessage?.sentAt || null,
        averageDailyMessages,
      },
    });
  }
}