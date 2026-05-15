import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../pluggins/prisma.js";
import { generateClientId, generateApiKey } from "./AuthServices.js";
import { authMiddleware } from "../../middleware/index.js";

interface RegisterBody {
  email: string;
  password: string;
  companyName: string;
  phoneNumber: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export class AuthController {
  constructor(private fastify: FastifyInstance) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    const { email, password, companyName, phoneNumber } =
      request.body as RegisterBody;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return reply.code(409).send({ error: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const clientId = generateClientId(companyName);
    const apiKey = generateApiKey();

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        companyName,
        phoneNumber,
        clientId,
        apiKey,
      },
    });

    const token = this.generateToken(user);

    return reply.code(201).send({
      success: true,
      data: {
        id: user.id,
        clientId: user.clientId,
        email: user.email,
        companyName: user.companyName,
        apiKey: user.apiKey,
        token,
      },
    });
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as LoginBody;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return reply.code(401).send({ error: "Credenciales inválidas" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return reply.code(401).send({ error: "Credenciales inválidas" });
    }

    const token = this.generateToken(user);

    return reply.send({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          clientId: user.clientId,
          email: user.email,
          companyName: user.companyName,
        },
      },
    });
  }

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    authMiddleware(request, reply);

    if (!request.user) {
      return reply.code(401).send({ error: "Usuario no autenticado" });
    }

    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
    });

    if (!user) {
      return reply.code(404).send({ error: "Usuario no encontrado" });
    }

    return reply.send({
      success: true,
      data: {
        id: user.id,
        clientId: user.clientId,
        email: user.email,
        companyName: user.companyName,
      },
    });
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    return reply.code(200).send({ success: true });
  }

  private generateToken(user: { id: string; clientId: string; email: string }) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET no configurado");
    }

    return jwt.sign(
      { id: user.id, clientId: user.clientId, email: user.email },
      secret,
      { expiresIn: "7d" }
    );
  }
}