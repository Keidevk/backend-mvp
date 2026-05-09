# API Documentation

Base URL: `http://localhost:3000`

Documentación técnica de los endpoints disponibles en el backend MVP.

## Tabla de Contenidos

- [Products API](#products-api)
  - [Crear Producto](#crear-producto)
  - [Listar Productos por Cliente](#listar-productos-por-cliente)
  - [Actualizar Producto](#actualizar-producto)
  - [Eliminar Producto](#eliminar-producto)
- [WhatsApp API](#whatsapp-api)
  - [Iniciar Sesión de WhatsApp](#iniciar-sesión-de-whatsapp)
  - [Estado del Servicio WhatsApp](#estado-del-servicio-whatsapp)
  - [Estado de Sesión WhatsApp](#estado-de-sesión-whatsapp)
- [LLM API](#llm-api)
  - [Verificar Estado del LLM](#verificar-estado-del-llm)
  - [Chat con IA](#chat-con-ia)

---

## Products API

### Crear Producto

**Método HTTP y Ruta:** `POST /api/productos/create`

**Descripción:** Crea un nuevo producto asociado a un cliente. El producto se almacena en la base de datos con los datos proporcionados.

**Autenticación:** Público (sin autenticación requerida)

**Parámetros de la Solicitud:**

| Nombre del Campo | Tipo de Dato | Obligatorio | Descripción |
|------------------|--------------|-------------|-------------|
| client_id | string | Sí | Identificador único del cliente al que pertenece el producto |
| name | string | Sí | Nombre del producto (mínimo 3 caracteres) |
| price | number | Sí | Precio del producto (valor no negativo) |
| Stock | integer | Sí | Cantidad disponible en inventario (valor no negativo) |
| description | string | No | Descripción detallada del producto |

**Ejemplos de Uso:**

```bash
curl -X POST http://localhost:3000/api/productos/create \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "client-123",
    "name": "Camiseta Oversize",
    "price": 29.99,
    "Stock": 50,
    "description": "Camiseta de algodón disponible en varios colores"
  }'
```

```json
{
  "client_id": "client-123",
  "name": "Camiseta Oversize",
  "price": 29.99,
  "Stock": 50,
  "description": "Camiseta de algodón disponible en varios colores"
}
```

**Respuestas:**

- **201 Created** - Producto creado exitosamente:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Camiseta Oversize",
  "price": 29.99,
  "stock": 50,
  "description": "Camiseta de algodón disponible en varios colores",
  "client_id": "client-123",
  "createdAt": "2026-05-09T00:00:00.000Z",
  "updatedAt": "2026-05-09T00:00:00.000Z"
}
```

- **400 Bad Request** - Error de validación en los datos proporcionados
- **500 Internal Server Error** - Error al crear el producto en la base de datos

---

### Listar Productos por Cliente

**Método HTTP y Ruta:** `GET /api/productos/client/:clientId`

**Descripción:** Obtiene todos los productos asociados a un cliente específico, ordenados por fecha de creación (más recientes primero).

**Autenticación:** Público (sin autenticación requerida)

**Parámetros de la Solicitud:**

| Nombre del Campo | Tipo de Dato | Obligatorio | Descripción |
|------------------|--------------|-------------|-------------|
| clientId | string | Sí | Identificador único del cliente |

**Ejemplos de Uso:**

```bash
curl -X GET http://localhost:3000/api/productos/client/client-123
```

**Respuestas:**

- **200 OK** - Lista de productos del cliente:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Camiseta Oversize",
    "price": 29.99,
    "stock": 50,
    "description": "Camiseta de algodón",
    "client_id": "client-123",
    "createdAt": "2026-05-09T00:00:00.000Z",
    "updatedAt": "2026-05-09T00:00:00.000Z"
  }
]
```

- **500 Internal Server Error** - Error al consultar la base de datos

---

### Actualizar Producto

**Método HTTP y Ruta:** `PUT /api/productos/:id`

**Descripción:** Actualiza los campos de un producto existente. Solo se modificarán los campos proporcionados en el cuerpo de la solicitud.

**Autenticación:** Público (sin autenticación requerida)

**Parámetros de la Solicitud:**

| Nombre del Campo | Tipo de Dato | Obligatorio | Descripción |
|------------------|--------------|-------------|-------------|
| id | string (UUID) | Sí | Identificador único del producto (path parameter) |
| name | string | No | Nuevo nombre del producto |
| price | number | No | Nuevo precio del producto |
| Stock | integer | No | Nueva cantidad en inventario |
| description | string | No | Nueva descripción del producto |

**Ejemplos de Uso:**

```bash
curl -X PUT http://localhost:3000/api/productos/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 34.99,
    "Stock": 45
  }'
```

```json
{
  "price": 34.99,
  "Stock": 45
}
```

**Respuestas:**

- **200 OK** - Producto actualizado exitosamente:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Camiseta Oversize",
  "price": 34.99,
  "stock": 45,
  "description": "Camiseta de algodón",
  "client_id": "client-123",
  "createdAt": "2026-05-09T00:00:00.000Z",
  "updatedAt": "2026-05-09T01:00:00.000Z"
}
```

- **404 Not Found** - El producto con el ID especificado no existe
- **500 Internal Server Error** - Error al actualizar el producto

---

### Eliminar Producto

**Método HTTP y Ruta:** `DELETE /api/productos/:id`

**Descripción:** Elimina permanentemente un producto de la base de datos.

**Autenticación:** Público (sin autenticación requerida)

**Parámetros de la Solicitud:**

| Nombre del Campo | Tipo de Dato | Obligatorio | Descripción |
|------------------|--------------|-------------|-------------|
| id | string (UUID) | Sí | Identificador único del producto a eliminar |

**Ejemplos de Uso:**

```bash
curl -X DELETE http://localhost:3000/api/productos/550e8400-e29b-41d4-a716-446655440000
```

**Respuestas:**

- **204 No Content** - Producto eliminado exitosamente (sin cuerpo de respuesta)
- **404 Not Found** - El producto con el ID especificado no existe
- **500 Internal Server Error** - Error al eliminar el producto

---

## WhatsApp API

### Iniciar Sesión de WhatsApp

**Método HTTP y Ruta:** `POST /api/whatsapp/start`

**Descripción:** Inicia el proceso de vinculación de una sesión de WhatsApp para un cliente específico. El código QR para escanear aparecerá en la consola del servidor.

**Autenticación:** Público (sin autenticación requerida)

**Parámetros de la Solicitud:**

| Nombre del Campo | Tipo de Dato | Obligatorio | Descripción |
|------------------|--------------|-------------|-------------|
| clientId | string | Sí | Identificador único del cliente para la sesión de WhatsApp |

**Ejemplos de Uso:**

```bash
curl -X POST http://localhost:3000/api/whatsapp/start \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client-123"
  }'
```

```json
{
  "clientId": "client-123"
}
```

**Respuestas:**

- **200 OK** - Proceso de vinculación iniciado:
```json
{
  "success": true,
  "message": "Proceso de vinculación iniciado",
  "data": {
    "sessionId": "client-123"
  }
}
```

- **400 Bad Request** - El campo `clientId` es obligatorio y no puede estar vacío
- **500 Internal Server Error** - No se pudo inicializar la sesión de WhatsApp

---

### Estado del Servicio WhatsApp

**Método HTTP y Ruta:** `GET /api/whatsapp/health`

**Descripción:** Verifica el estado de salud general del servicio de WhatsApp.

**Autenticación:** Público (sin autenticación requerida)

**Respuestas:**

- **200 OK** - Servicio activo:
```json
{
  "status": "online",
  "service": "whatsapp-manager"
}
```

---

### Estado de Sesión WhatsApp

**Método HTTP y Ruta:** `GET /api/whatsapp/status/:clientId`

**Descripción:** Obtiene el estado de conexión de una sesión de WhatsApp específica.

**Autenticación:** Público (sin autenticación requerida)

**Parámetros de la Solicitud:**

| Nombre del Campo | Tipo de Dato | Obligatorio | Descripción |
|------------------|--------------|-------------|-------------|
| clientId | string | Sí | Identificador único del cliente |

**Ejemplos de Uso:**

```bash
curl -X GET http://localhost:3000/api/whatsapp/status/client-123
```

**Respuestas:**

- **200 OK** - Estado de la sesión:
```json
{
  "clientId": "client-123",
  "active": true,
  "state": "connected"
}
```

---

## LLM API

### Verificar Estado del LLM

**Método HTTP y Ruta:** `GET /api/llm/ai-status`

**Descripción:** Verifica la conectividad con el modelo de lenguaje (Ollama) y confirma que está operativo.

**Autenticación:** Público (sin autenticación requerida)

**Respuestas:**

- **200 OK** - LLM conectado correctamente:
```json
{
  "status": "ok",
  "message": "El LLM está conectado correctamente"
}
```

- **500 Internal Server Error** - No se pudo conectar con Ollama:
```json
{
  "status": "error",
  "message": "No se pudo conectar con Ollama"
}
```

---

### Chat con IA

**Método HTTP y Ruta:** `POST /api/llm/chat`

**Descripción:** Endpoint para interactuar con el asistente de IA. Identifica productos mencionados en el mensaje, busca coincidencias en la base de datos y genera una respuesta contextual.

**Autenticación:** Público (sin autenticación requerida)

**Parámetros de la Solicitud:**

| Nombre del Campo | Tipo de Dato | Obligatorio | Descripción |
|------------------|--------------|-------------|-------------|
| message | string | Sí | Mensaje del usuario para procesar |
| clientId | string | Sí | Identificador del cliente para filtrar productos |

**Ejemplos de Uso:**

```bash
curl -X POST http://localhost:3000/api/llm/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Busco una camiseta",
    "clientId": "client-123"
  }'
```

```json
{
  "message": "Busco una camiseta",
  "clientId": "client-123"
}
```

**Respuestas:**

- **200 OK** - Respuesta generada por el asistente:
```json
{
  "extracted_keyword": "camiseta",
  "response": "Encontré los siguientes productos relacionados con 'camiseta': Camiseta Oversize: $29.99 (Stock: 50), Camiseta Básica: $19.99 (Stock: 100)"
}
```

- **200 OK** - Cuando no se identifica producto:
```json
{
  "response": "Lo siento, ¿podrías decirme qué producto buscas?"
}
```