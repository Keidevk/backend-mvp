import { prisma } from "../../pluggins/prisma.js";

export class DashboardServices {
  static async getBotByUserId(userId: string) {
    return prisma.bot.findUnique({
      where: { userId },
    });
  }

  static async createBot(userId: string) {
    return prisma.bot.create({
      data: { userId },
    });
  }

  static async getOrCreateBot(userId: string) {
    let bot = await this.getBotByUserId(userId);
    if (!bot) {
      bot = await this.createBot(userId);
    }
    return bot;
  }

  static async updateBotStatus(
    userId: string,
    data: {
      isActive?: boolean;
      whatsappSessionId?: string | null;
      connectedAt?: Date | null;
      disconnectedAt?: Date | null;
    }
  ) {
    return prisma.bot.update({
      where: { userId },
      data,
    });
  }

  static async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { clientId: true },
    });
  }

  static async getMessagesByBotId(
    botId: string,
    from?: Date,
    to?: Date
  ) {
    const where: { botId: string; sentAt?: { gte?: Date; lte?: Date } } = {
      botId,
    };

    if (from || to) {
      where.sentAt = {};
      if (from) where.sentAt.gte = from;
      if (to) where.sentAt.lte = to;
    }

    return prisma.message.findMany({
      where,
      orderBy: { sentAt: "asc" },
    });
  }

  static async getMessagesCountByBotId(
    botId: string,
    from?: Date,
    to?: Date
  ) {
    const where: { botId: string; sentAt?: { gte?: Date; lte?: Date } } = {
      botId,
    };

    if (from || to) {
      where.sentAt = {};
      if (from) where.sentAt.gte = from;
      if (to) where.sentAt.lte = to;
    }

    const [total, incoming, outgoing] = await Promise.all([
      prisma.message.count({ where }),
      prisma.message.count({ where: { ...where, direction: "incoming" } }),
      prisma.message.count({ where: { ...where, direction: "outgoing" } }),
    ]);

    return { total, incoming, outgoing };
  }

  static async getMessageTimeline(
    botId: string,
    from?: Date,
    to?: Date
  ) {
    const where: { botId: string; sentAt?: { gte?: Date; lte?: Date } } = {
      botId,
    };

    if (from || to) {
      where.sentAt = {};
      if (from) where.sentAt.gte = from;
      if (to) where.sentAt.lte = to;
    }

    const messages = await prisma.message.findMany({
      where,
      select: { direction: true, sentAt: true },
      orderBy: { sentAt: "asc" },
    });

    const timelineMap = new Map<string, { incoming: number; outgoing: number }>();

    for (const msg of messages) {
      const dateKey = msg.sentAt.toISOString().split("T")[0] as string;
      const existing = timelineMap.get(dateKey) || { incoming: 0, outgoing: 0 };
      if (msg.direction === "incoming") {
        existing.incoming++;
      } else {
        existing.outgoing++;
      }
      timelineMap.set(dateKey, existing);
    }

    return Array.from(timelineMap.entries()).map(([date, counts]) => ({
      date,
      ...counts,
    }));
  }

  static async getLastMessageByBotId(botId: string) {
    return prisma.message.findFirst({
      where: { botId },
      orderBy: { sentAt: "desc" },
      select: { sentAt: true },
    });
  }
}