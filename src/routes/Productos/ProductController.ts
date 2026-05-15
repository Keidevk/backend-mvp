import type { FastifyInstance } from "fastify";
import type { ProductData } from "../../types/Product.js";
import { prisma } from '../../plugins/prisma.js'

export class ProductController {
    constructor(private fastify: FastifyInstance) {}

    // CREATE
    async createProduct(data: ProductData) {
        try {
            return await prisma.product.create({
                data: {
                    client_id: data.client_id,
                    name: data.name,
                    price: data.price,
                    stock: data.stock,
                    description: data.description,
                }
            });
        } catch (error) {
            this.fastify.log.error(error);
            throw new Error("Error al crear el producto");
        }
    }

    // READ (Todos los de un cliente)
    async getProductsByClient(clientId: string) {
        return await prisma.product.findMany({
            where: { client_id: clientId },
            orderBy: { createdAt: 'desc' }
        });
    }

    // READ (Uno solo)
    async getProductById(id: string) {
        return await prisma.product.findUnique({
            where: { id }
        });
    }

    // UPDATE
    async updateProduct(id: string, data: Partial<ProductData>) {
        try {
            return await prisma.product.update({
                where: { id },
                data: {
                    ...(data.name !== undefined && { name: data.name }),
                    ...(data.price !== undefined && { price: data.price }),
                    ...(data.stock !== undefined && { stock: data.stock }),
                    ...(data.description !== undefined && { description: data.description }),
                }
            });
        } catch (error) {
            this.fastify.log.error(error);
            throw new Error("Error al actualizar el producto");
        }
    }

    // DELETE
    async deleteProduct(id: string) {
        try {
            await prisma.product.delete({
                where: { id }
            });
            return { deleted: true };
        } catch (error) {
            this.fastify.log.error(error);
            throw new Error("Error al eliminar el producto");
        }
    }
}
