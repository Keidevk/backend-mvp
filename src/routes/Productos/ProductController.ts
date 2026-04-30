import type { FastifyInstance } from "fastify";
import type { ProductData } from "../../types/Product.js";
import { prisma } from '../../pluggins/prisma.js'

export class ProductoController {
    constructor(private fastify: FastifyInstance) {}

    // CREATE
    async createProduct(data: ProductData) {
        try {
            return await prisma.product.create({
                data: {
                    client_id: data.client_id,
                    name: data.name,
                    price: data.price,
                    stock: data.Stock,
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
            const updateData: any = {};

            if (data.name !== undefined) updateData.name = data.name;
            if (data.price !== undefined) updateData.price = data.price;
            if (data.Stock !== undefined) updateData.stock = data.Stock;
            if (data.description !== undefined) updateData.description = data.description;

            return await prisma.product.update({
                where: { id },
                data: updateData
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