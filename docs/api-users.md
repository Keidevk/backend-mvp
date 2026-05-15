# API Documentation

Base URL: `http://localhost:3000`

Documentación técnica de los endpoints disponibles en el backend MVP.

## Tabla de Contenidos

- [Auth API](#auth-api)
  - [Registro de Usuario](#registro-de-usuario)
  - [Inicio de Sesión](#inicio-de-sesión)
- [Products API](#products-api)
  - [Crear Producto](#crear-producto)
  - [Listar Productos por Cliente](#listar-productos-por-cliente)
  - [Actualizar Producto](#actualizar-producto)
  - [Eliminar Producto](#eliminar-producto)
- [WhatsApp API](#whatsapp-api)
  - [Iniciar Sesión de WhatsApp](#iniciar-sesión-de-whatsapp)
  - [Obtener QR por Polling](#obtener-qr-por-polling)
  - [Estado del Servicio WhatsApp](#estado-del-servicio-whatsapp)
  - [Estado de Sesión WhatsApp](#estado-de-sesión-whatsapp)
- [LLM API](#llm-api)
  - [Verificar Estado del LLM](#verificar-estado-del-llm)
  - [Chat con IA](#chat-con-ia)
- [Dashboard API](#dashboard-api)
  - [Activar Bot](#activar-bot)
  - [Desactivar Bot](#desactivar-bot)
  - [Obtener Estado del Bot](#obtener-estado-del-bot)
  - [Métricas de Mensajes](#métricas-de-mensajes)
  - [Resumen de Métricas](#resumen-de-métricas)

---

## Auth API

### Registro de Usuario

**Método HTTP y Ruta:** `POST /api/auth/register`

**Descripción:** Registra un nuevo usuario en el sistema. Genera un `clientId` y `apiKey` automáticamente.

**Autenticación:** Público (sin autenticación requerida)

**Parámetros de la Solicitud:**

| Nombre | Tipo | Obligatorio | Descripción |
|--------|------|-------------|-------------|
| email | string | Sí | Correo electrónico del usuario |
| password | string | Sí | Contraseña |
| companyName | string | Sí | Nombre de la empresa/negocio |
| phoneNumber | string | Sí | Número de teléfono |

**Ejemplos de Uso:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "empresa@ejemplo.com",
    "password": "miPassword123",
    "companyName": "Mi Empresa",
    "phoneNumber": "+521234567890"
  }'
```

**Respuestas:**

- **201 Created** - Usuario registrado exitosamente:
```json
{
  "success": true,
  "data": {
    "id": "uuid-del-usuario",
    "clientId": "mi-empresa",
    "email": "empresa@ejemplo.com",
    "companyName": "Mi Empresa",
    "apiKey": "key-generada",
    "token": "jwt-token"
  }
}
```

- **409 Conflict** - El email ya está registrado:
```json
{
  "error": "El email ya está registrado"
}
```

---

### Inicio de Sesión

**Método HTTP y Ruta:** `POST /api/auth/login`

**Descripción:** Inicia sesión con credenciales y devuelve un token JWT.

**Autenticación:** Público (sin autenticación requerida)

**Parámetros de la Solicitud:**

| Nombre | Tipo | Obligatorio | Descripción |
|--------|------|-------------|-------------|
| email | string | Sí | Correo electrónico |
| password | string | Sí | Contraseña |

**Ejemplos de Uso:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "empresa@ejemplo.com",
    "password": "miPassword123"
  }'
```

**Respuestas:**

- **200 OK** - Inicio de sesión exitoso:
```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "uuid",
      "clientId": "mi-empresa",
      "email": "empresa@ejemplo.com",
      "companyName": "Mi Empresa"
    }
  }
}
```

- **401 Unauthorized** - Credenciales inválidas

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
| stock | integer | Sí | Cantidad disponible en inventario (valor no negativo) |
| description | string | No | Descripción detallada del producto |

**Ejemplos de Uso:**

```bash
curl -X POST http://localhost:3000/api/productos/create \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "client-123",
    "name": "Camiseta Oversize",
    "price": 29.99,
    "stock": 50,
    "description": "Camiseta de algodón disponible en varios colores"
  }'
```

```json
{
  "client_id": "client-123",
  "name": "Camiseta Oversize",
  "price": 29.99,
  "stock": 50,
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
| stock | integer | No | Nueva cantidad en inventario |
| description | string | No | Nueva descripción del producto |

**Ejemplos de Uso:**

```bash
curl -X PUT http://localhost:3000/api/productos/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 34.99,
    "stock": 45
  }'
```

```json
{
  "price": 34.99,
  "stock": 45
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

**Descripción:** Inicia el proceso de vinculación de WhatsApp. El QR se devuelve en la respuesta como string raw para renderizar con `react-qr-code`. **Nota:** El QR puede llegar asíncronamente; si la respuesta incluye `qrCode: null`, usar el endpoint de polling para obtenerlo.

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

**Respuestas:**

- **200 OK** - Proceso de vinculación iniciado:
```json
{
  "success": true,
  "message": "Proceso de vinculación iniciado",
  "data": {
    "sessionId": "client-123",
    "qrCode": "string-raw-del-qr-para-renderizar"
  }
}
```

- **400 Bad Request** - El campo `clientId` es obligatorio y no puede estar vacío
- **500 Internal Server Error** - No se pudo inicializar la sesión de WhatsApp

---

### Obtener QR por Polling

**Método HTTP y Ruta:** `GET /api/whatsapp/qr/:clientId`

**Descripción:** Endpoint de polling para obtener el QR cuando se genera de forma asíncrona. El frontend debe llamarlo cada 2-3 segundos hasta que `qrCode` no sea `null`. Una vez que la sesión se conecta, `qrCode` vuelve a `null`.

**Autenticación:** Público (sin autenticación requerida)

**Parámetros de la Solicitud:**

| Nombre | Tipo | Obligatorio | Descripción |
|--------|------|-------------|-------------|
| clientId | string | Sí | Identificador único del cliente |

**Ejemplos de Uso:**

```bash
curl -X GET http://localhost:3000/api/whatsapp/qr/client-123
```

**Respuestas:**

- **200 OK** - QR disponible o no:
```json
{
  "success": true,
  "data": {
    "qrCode": "string-raw-del-qr"
  }
}
```

Cuando aún no está disponible:
```json
{
  "success": true,
  "data": {
    "qrCode": null
  }
}
```

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

**Descripción:** Verifica la conectividad con el modelo de lenguaje y confirma que está operativo.

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

**Respuestas:**

- **200 OK** - Respuesta generada por el asistente:
```json
{
  "response": "Encontré los siguientes productos relacionados con 'camiseta': Camiseta Oversize: $29.99 (Stock: 50), Camiseta Básica: $19.99 (Stock: 100)"
}
```

- **200 OK** - Cuando no se identifica producto:
```json
{
  "response": "Lo siento, ¿podrías decirme qué producto buscas?"
}
```

---

## Dashboard API

Todas las rutas del dashboard requieren autenticación mediante JWT token en el header `Authorization: Bearer <token>`.

### Activar Bot

**Método HTTP y Ruta:** `POST /api/dashboard/bot/activate`

**Descripción:** Activa el bot de WhatsApp. Inicia la sesión y devuelve el QR para escanear. **El `whatsappSessionId` se guarda en la DB solo cuando el usuario escanea el QR exitosamente**, no al activar.

**Autenticación:** Requiere JWT token

**Ejemplos de Uso:**

```bash
curl -X POST http://localhost:3000/api/dashboard/bot/activate \
  -H "Authorization: Bearer <tu_token_jwt>"
```

**Respuestas:**

- **200 OK** - Bot activado, QR generado:
```json
{
  "success": true,
  "message": "Bot activado correctamente",
  "data": {
    "qrCode": "string-raw-del-qr"
  }
}
```

- **401 Unauthorized** - Token no proporcionado o inválido
- **404 Not Found** - Usuario no encontrado
- **500 Internal Server Error** - Error al iniciar la sesión de WhatsApp

---

### Desactivar Bot

**Método HTTP y Ruta:** `POST /api/dashboard/bot/deactivate`

**Descripción:** Desactiva el bot de WhatsApp para el usuario autenticado. Registra la hora de desconexión.

**Autenticación:** Requiere JWT token

**Parámetros de la Solicitud:** Sin cuerpo

**Ejemplos de Uso:**

```bash
curl -X POST http://localhost:3000/api/dashboard/bot/deactivate \
  -H "Authorization: Bearer <tu_token_jwt>"
```

**Respuestas:**

- **200 OK** - Bot desactivado exitosamente:
```json
{
  "success": true,
  "message": "Bot desactivado correctamente"
}
```

- **401 Unauthorized** - Token no proporcionado o inválido
- **404 Not Found** - Bot no encontrado

---

### Obtener Estado del Bot

**Método HTTP y Ruta:** `GET /api/dashboard/bot/status`

**Descripción:** Obtiene el estado actual del bot. Mientras el QR no ha sido escaneado, `whatsappSessionId` y `connectedAt` serán `null`. El frontend debe pollear este endpoint cada 3s para detectar cuándo se completó la vinculación.

**Autenticación:** Requiere JWT token

**Ejemplos de Uso:**

```bash
curl -X GET http://localhost:3000/api/dashboard/bot/status \
  -H "Authorization: Bearer <tu_token_jwt>"
```

**Respuestas:**

- **200 OK** - Estado del bot (QR pendiente de escaneo):
```json
{
  "success": true,
  "data": {
    "isActive": true,
    "whatsappSessionId": null,
    "connectedAt": null,
    "disconnectedAt": null
  }
}
```

- **200 OK** - Estado del bot (conectado):
```json
{
  "success": true,
  "data": {
    "isActive": true,
    "whatsappSessionId": "client-empresa-abc123",
    "connectedAt": "2026-05-15T10:00:00.000Z",
    "disconnectedAt": null
  }
}
```

- **401 Unauthorized** - Token no proporcionado o inválido
- **404 Not Found** - Bot no encontrado

---

### Métricas de Mensajes

**Método HTTP y Ruta:** `GET /api/dashboard/metrics/messages`

**Descripción:** Obtiene estadísticas detalladas de mensajes con soporte para filtro por fechas.

**Autenticación:** Requiere JWT token

**Parámetros de Query:**

| Nombre | Tipo | Obligatorio | Descripción |
|--------|------|-------------|-------------|
| from | string (ISO date) | No | Fecha inicio para filtrar |
| to | string (ISO date) | No | Fecha fin para filtrar |

**Ejemplos de Uso:**

```bash
curl -X GET "http://localhost:3000/api/dashboard/metrics/messages?from=2026-05-01&to=2026-05-15" \
  -H "Authorization: Bearer <tu_token_jwt>"
```

**Respuestas:**

- **200 OK**:
```json
{
  "success": true,
  "data": {
    "total": 150,
    "incoming": 80,
    "outgoing": 70,
    "timeline": [
      {
        "date": "2026-05-14",
        "incoming": 12,
        "outgoing": 10
      },
      {
        "date": "2026-05-15",
        "incoming": 8,
        "outgoing": 6
      }
    ]
  }
}
```

---

### Resumen de Métricas

**Método HTTP y Ruta:** `GET /api/dashboard/metrics/summary`

**Descripción:** Obtiene un resumen general de métricas del bot, incluyendo el contador de mensajes para facturación.

**Autenticación:** Requiere JWT token

**Ejemplos de Uso:**

```bash
curl -X GET http://localhost:3000/api/dashboard/metrics/summary \
  -H "Authorization: Bearer <tu_token_jwt>"
```

**Respuestas:**

- **200 OK**:
```json
{
  "success": true,
  "data": {
    "totalMessages": 150,
    "messageCredits": 300,
    "isBotActive": true,
    "lastMessageAt": "2026-05-15T10:30:00.000Z",
    "averageDailyMessages": 12
  }
}
```

---

## Configuración General

### CORS

Configurado para aceptar peticiones desde `http://localhost:4321` (Astro frontend). Métodos permitidos: GET, POST, PUT, DELETE, PATCH. Credenciales habilitadas.

### Base de Datos

PostgreSQL online gestionado por Prisma en `db.prisma.io`. Migraciones automáticas vía Prisma Migrate.

### Autenticación

JWT tokens con expiración de 7 días. Enviar en todas las rutas protegidas como `Authorization: Bearer <token>`.
