import type { FastifyInstance } from "fastify";
import { ProductoController } from "./ProductController.js";
import type { ProductData } from "../../types/Product.js";

// Esquema de validación para el Body de creación
const createProductSchema = {
    body: {
        type: 'object',
        required: ['client_id', 'name', 'price', 'Stock'],
        properties: {
            client_id: { type: 'string' },
            name: { type: 'string', minLength: 3 },
            price: { type: 'number', minimum: 0 },
            Stock: { type: 'integer', minimum: 0 },
            description: { type: 'string' }
        }
    }
};

// Esquema para rutas que piden ID en params
const productIdParamSchema = {
    params: {
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' } // Si usas UUIDs en Prisma
        }
    }
};

export async function ProductoRouter(fastify: FastifyInstance) {
    const controller = new ProductoController(fastify);

    // CREATE
    fastify.post('/create', { schema: createProductSchema }, async (request, reply) => {
        const data = request.body as ProductData;
        const result = await controller.createProduct(data);
        return reply.code(201).send(result);
    });

    // READ (Todos los productos de un cliente)
    fastify.get('/client/:clientId', async (request, reply) => {
        const { clientId } = request.params as { clientId: string };
        const products = await controller.getProductsByClient(clientId);
        return products;
    });

    // UPDATE
    fastify.put('/:id', { schema: productIdParamSchema }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const data = request.body as Partial<ProductData>;
        const updated = await controller.updateProduct(id, data);
        return updated;
    });

    // DELETE
    fastify.delete('/:id', { schema: productIdParamSchema }, async (request, reply) => {
        const { id } = request.params as { id: string };
        await controller.deleteProduct(id);
        return reply.code(204).send(); // No content
    });
}