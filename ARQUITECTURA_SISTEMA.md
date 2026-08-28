## 🏗️ ARQUITECTURA DEL SISTEMA CRUD

### Flujo de Comunicación Frontend-Backend

```
┌─────────────────────────────────────────────────────────────────┐
│                      NAVEGADOR / FRONTEND                       │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │login.html    │  │crear-...html │  │listado-...html         │
│  │register.html │  │(formularios) │  │(tabla datos) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            │                                     │
│          JavaScript CRUD Scripts                                │
│    ┌──────────────────────────────────┐                         │
│    │ • clientes.js                    │                         │
│    │ • crear-cliente.js               │                         │
│    │ • productos.js                   │                         │
│    │ • crear-pro.js                   │                         │
│    │                                  │                         │
│    │ Responsabilidades:               │                         │
│    │ • Validar datos                  │                         │
│    │ • Enviar requests HTTP (fetch)   │                         │
│    │ • Almacenar usuario en localStorage          │                         │
│    │ • Mostrar/actualizar tabla        │                         │
│    │ • Manejar errores y alertas      │                         │
│    └──────────────────────────────────┘                         │
│                    │                                             │
│            Headers agregados:                                   │
│            X-User-Role: "administrador"                         │
│            X-User-ID: "123"                                     │
│                    │                                             │
└────────────────────┼─────────────────────────────────────────────┘
                     │
             HTTP Requests (fetch)
                     │
        ┌────────────┴─────────────┐
        ▼                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SERVIDOR NODE.JS / EXPRESS                    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              RUTAS (Routes)                              │  │
│  │                                                          │  │
│  │  /api/clientes                                          │  │
│  │  /api/productos                                         │  │
│  │  /api/usuarios                                          │  │
│  │  /api/pedidos                                           │  │
│  └──────────────┬─────────────────────────────────────────┘  │
│                 │                                              │
│  ┌──────────────▼─────────────────────────────────────────┐  │
│  │     MIDDLEWARE DE AUTENTICACIÓN                         │  │
│  │                                                          │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │ logOperacion()                                  │   │  │
│  │  │ → Log de operaciones con timestamp             │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  │                                                          │  │
│  │  Para POST/PUT (Crear/Editar):                         │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │ verificarVendedorOAdmin()                       │   │  │
│  │  │ → if (role !== vendedor && role !== admin)     │   │  │
│  │  │      return 403 Forbidden                       │   │  │
│  │  │ → else next()                                  │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  │                                                          │  │
│  │  Para DELETE (Eliminar):                               │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │ verificarAdmin()                                │   │  │
│  │  │ → if (role !== administrador)                  │   │  │
│  │  │      return 403 Forbidden                       │   │  │
│  │  │ → else next()                                  │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  └──────────────┬─────────────────────────────────────────┘  │
│                 │                                              │
│  ┌──────────────▼─────────────────────────────────────────┐  │
│  │            CONTROLADORES (Controllers)                 │  │
│  │                                                          │  │
│  │  • clientesController.js                               │  │
│  │    - getClientes()     [GET]                           │  │
│  │    - createCliente()   [POST]                          │  │
│  │    - updateCliente()   [PUT]                           │  │
│  │    - deleteCliente()   [DELETE]                        │  │
│  │                                                          │  │
│  │  • productosController.js                              │  │
│  │    - getProductos()    [GET]                           │  │
│  │    - createProducto()  [POST]                          │  │
│  │    - updateProducto()  [PUT]                           │  │
│  │    - deleteProducto()  [DELETE]                        │  │
│  │                                                          │  │
│  │  • authController.js                                   │  │
│  │    - login()           [POST]                          │  │
│  │                                                          │  │
│  │  Responsabilidades:                                    │  │
│  │  • Parsear datos de request                           │  │
│  │  • Validar datos de negocio                           │  │
│  │  • Conectar con base de datos                         │  │
│  │  • Manejar errores específicos (dup key, etc)         │  │
│  │  • Devolver respuestas JSON                           │  │
│  └──────────────┬─────────────────────────────────────────┘  │
│                 │                                              │
│  ┌──────────────▼─────────────────────────────────────────┐  │
│  │          CONEXIÓN A BASE DE DATOS                       │  │
│  │                                                          │  │
│  │  • Pool de conexiones MySQL (10 conexiones)            │  │
│  │  • Configuración: host, usuario, password, BD          │  │
│  │  • Manejo de transacciones                             │  │
│  │  • Recuperación automática de conexiones               │  │
│  └──────────────┬─────────────────────────────────────────┘  │
│                 │                                              │
└─────────────────┼───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MYSQL / MariaDB                               │
│                                                                   │
│  Base de datos: tienda_online                                  │
│                                                                   │
│  ┌────────────────────────────────┐                            │
│  │  Tabla: clientes               │                            │
│  │ ────────────────────────────    │                            │
│  │ id_cliente (INT, PK)            │                            │
│  │ nombre (VARCHAR)                │                            │
│  │ apellido (VARCHAR)              │                            │
│  │ email (VARCHAR, UNIQUE)         │                            │
│  │ celular (VARCHAR)               │                            │
│  │ direccion (VARCHAR)             │                            │
│  │ direccion2 (VARCHAR)            │                            │
│  │ descripcion (TEXT)              │                            │
│  │ created_at (TIMESTAMP)          │                            │
│  │ updated_at (TIMESTAMP)          │                            │
│  └────────────────────────────────┘                            │
│                                                                   │
│  ┌────────────────────────────────┐                            │
│  │  Tabla: productos              │                            │
│  │ ────────────────────────────    │                            │
│  │ id (INT, PK)                    │                            │
│  │ nombre (VARCHAR)                │                            │
│  │ descripcion (TEXT)              │                            │
│  │ precio (DECIMAL)                │                            │
│  │ stock (INT)                     │                            │
│  │ imagen (VARCHAR)                │                            │
│  │ created_at (TIMESTAMP)          │                            │
│  │ updated_at (TIMESTAMP)          │                            │
│  └────────────────────────────────┘                            │
│                                                                   │
│  ┌────────────────────────────────┐                            │
│  │  Tabla: roles (usuarios)        │                            │
│  │ ────────────────────────────    │                            │
│  │ id (INT, PK)                    │                            │
│  │ usuario (VARCHAR)               │                            │
│  │ contrasena (VARCHAR)            │                            │
│  │ rol (VARCHAR)                   │                            │
│  │   → "administrador"             │                            │
│  │   → "vendedor"                  │                            │
│  └────────────────────────────────┘                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 TABLA DE PERMISOS POR ROL

### Matriz de Acceso

```
                    │ ADMINISTRADOR │ VENDEDOR │ CLIENTE*
────────────────────┼───────────────┼──────────┼─────────
GET /clientes       │      ✅       │    ✅    │   ❌
POST /clientes      │      ✅       │    ✅    │   ❌
PUT /clientes/:id   │      ✅       │    ✅    │   ❌
DELETE /clientes/:id│      ✅       │    ❌    │   ❌
────────────────────┼───────────────┼──────────┼─────────
GET /productos      │      ✅       │    ✅    │   ✅
POST /productos     │      ✅       │    ✅    │   ❌
PUT /productos/:id  │      ✅       │    ✅    │   ❌
DELETE /productos   │      ✅       │    ❌    │   ❌
────────────────────┼───────────────┼──────────┼─────────
GET /pedidos        │      ✅       │    ✅    │   ✅
POST /pedidos       │      ✅       │    ✅    │   ✅
PUT /pedidos/:id    │      ✅       │    ✅    │   ✅
DELETE /pedidos     │      ✅       │    ❌    │   ❌
────────────────────┼───────────────┼──────────┼─────────

* Cliente = Sin rol o sin autenticación
```

---

## 🔄 CICLO DE VIDA: CREAR CLIENTE

### 1. Usuario completa formulario
```html
<form id="formulario-cliente">
  <input id="nombre-cli" value="Juan"/>
  <input id="apellido-cli" value="Pérez"/>
  <input id="email-cli" value="juan@example.com"/>
  <input id="celular-cli" value="3001234567"/>
  <input id="direccion-cli" value="Calle 1 #20-30"/>
  <button type="submit">Crear Cliente</button>
</form>
```

### 2. JavaScript valida datos (crear-cliente.js)
```javascript
const datos = {
  nombre: "Juan",
  apellido: "Pérez",
  email: "juan@example.com",
  celular: "3001234567",
  direccion: "Calle 1 #20-30"
};

// Validaciones
- ✅ Nombre no vacío
- ✅ Email con formato válido (@)
- ✅ Celular no vacío
- ✅ Dirección no vacío
```

### 3. Envía POST a /api/clientes
```javascript
fetch('http://localhost:3000/api/clientes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Role': 'vendedor',      // Rol del usuario
    'X-User-ID': '5'                // ID del usuario
  },
  body: JSON.stringify(datos)
})
```

### 4. Middleware verifica permisos
```javascript
// auth.js: verificarVendedorOAdmin()
const userRole = req.headers['x-user-role'];

if (userRole !== 'vendedor' && userRole !== 'administrador') {
  return res.status(403).json({ 
    message: 'No tienes permiso para crear clientes' 
  });
}
```

### 5. Controller procesa solicitud
```javascript
// clientesController.js: createCliente()

// 1. Valida datos requeridos
if (!nombre || !apellido || !email || !celular || !direccion) {
  return res.status(400).json({ 
    message: 'Campos requeridos faltantes' 
  });
}

// 2. Intenta insertar en BD
INSERT INTO clientes 
  (nombre, apellido, email, celular, direccion, direccion2, descripcion)
VALUES 
  ('Juan', 'Pérez', 'juan@example.com', '3001234567', 'Calle 1 #20-30', '', '')

// 3. Si email duplicado → error
ER_DUP_ENTRY → res.status(409).json({ message: 'Email ya registrado' })

// 4. Si éxito → devuelve ID
res.status(201).json({ 
  message: 'Cliente creado con éxito',
  id: 21 
})
```

### 6. Base de datos guarda registro
```sql
INSERT INTO clientes (...)
  VALUES ('Juan', 'Pérez', 'juan@example.com', '3001234567', 'Calle 1 #20-30', '', '');
-- Inserta con id=21, created_at=NOW(), updated_at=NOW()
```

### 7. Frontend recibe respuesta
```javascript
// Si status 201
✅ Mostrar alerta: "Cliente creado correctamente"
✅ Limpiar sessionStorage
✅ Redirigir a listado-clientes.html después de 1.5s

// Si status 400
❌ Mostrar alerta: "Campos requeridos: nombre, apellido..."

// Si status 409
❌ Mostrar alerta: "El email ya está registrado"

// Si status 403
❌ Mostrar alerta: "No tienes permiso para crear clientes"

// Si status 500
❌ Mostrar alerta: "Error interno del servidor"
```

### 8. Usuario ve resultado
```
Página redirige a: listado-clientes.html
Script cargar Clientes automáticamente:
GET /api/clientes 
→ Carga todos los clientes
→ "Juan Pérez" aparece en la tabla
```

---

## 🔄 CICLO DE VIDA: ELIMINAR CLIENTE

### 1. Usuario hace click en "Eliminar"
```
[Editar] [Eliminar] ← Click aquí
```

### 2. JavaScript pide confirmación
```javascript
if (!confirm('¿Seguro de eliminar este cliente?')) {
  return; // Cancela si dice "No"
}
```

### 3. Envía DELETE a /api/clientes/:id
```javascript
fetch(`http://localhost:3000/api/clientes/${id}`, {
  method: 'DELETE',
  headers: {
    'X-User-Role': 'administrador',  // SOLO ADMIN
    'X-User-ID': '1'
  }
})
```

### 4. Middleware verifica que sea Admin
```javascript
// auth.js: verificarAdmin()
const userRole = req.headers['x-user-role'];

if (userRole !== 'administrador') {
  return res.status(403).json({ 
    message: 'Solo administradores pueden eliminar' 
  });
}
→ next()  // Si es admin, permite continuar
```

### 5. Controller elimina registro
```javascript
// clientesController.js: deleteCliente()
DELETE FROM clientes WHERE id_cliente = 21

if (affectedRows > 0) {
  res.json({ message: 'Cliente eliminado con éxito' })
} else {
  res.status(404).json({ message: 'Cliente no encontrado' })
}
```

### 6. Base de datos elimina fila
```sql
DELETE FROM clientes WHERE id_cliente = 21;
-- Fila eliminada permanentemente
```

### 7. Frontend actualiza tabla
```javascript
// Si status 200
✅ Mostrar alerta: "Cliente eliminado correctamente"
✅ Recargar clientes con GET /api/clientes
✅ Tabla se actualiza automáticamente
```

**Nota:** Si Vendedor intenta eliminar:
```
❌ Respuesta 403: "No tienes permiso para eliminar"
❌ Alerta: "No tienes permisos para eliminar clientes"
```

---

## 🔐 SEGURIDAD IMPLEMENTADA

### 1. **Validación de Permisos en Middleware**
- Valida rol antes de procesar request
- Devuelve 403 si no tiene permisos
- No permite acceso a datos si no es autorizado

### 2. **Validación de Datos en Controller**
- Verifica campos requeridos
- Valida formato (email, teléfono, etc)
- Maneja duplicados de email

### 3. **Manejo de Errores**
- Captura excepciones SQL
- Retorna mensajes específicos (ER_DUP_ENTRY)
- No expone detalles internos del servidor

### 4. **Headers de Autenticación**
- X-User-Role: Rol del usuario actual
- X-User-ID: ID del usuario
- Content-Type: application/json

### 5. **Base de Datos**
- Unique constraint en email
- NOT NULL en campos requeridos
- Timestamps auto-actualización
- Foreign keys entre tablas

---

## 🚀 MEJORAS FUTURAS

```javascript
// 1. Tokens JWT en lugar de headers simples
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// 2. Hash de contraseñas con bcrypt
bcrypt.hash(password, saltRounds)

// 3. Rate limiting para prevenir ataques
limiter.windowMs = 15 * 60 * 1000  // 15 minutos
limiter.max = 100  // máximo 100 requests

// 4. CORS configurado específicamente
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001']
}))

// 5. Validación de entrada con librería
const { body, validationResult } = require('express-validator');

// 6. Logging completo
logger.info('Usuario creó cliente', { userId, clienteId })

// 7. Auditoría de cambios
INSERT INTO auditoria (usuario, tabla, accion, datos_antes, datos_despues)
```

---

**Diagrama generado:** 28 de Agosto de 2026
**Versión arquitectura:** 1.0
**Estado:** ✅ Implementado y funcional
