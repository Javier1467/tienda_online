## 🚀 GUÍA DE PRUEBA RÁPIDA - Módulo de Clientes

### 1️⃣ ACCEDER AL SISTEMA

**URL de acceso:**
```
http://localhost:3000/index.html
```

O abre el navegador y navega a:
```
file:///c:/Users/Usuario/Downloads/tienda_online/frontend-tiendaonline/frontend-apicrud/index.html
```

---

### 2️⃣ PÁGINAS DISPONIBLES

#### 📍 Módulo de Clientes

**Ver Clientes:**
```
http://localhost/clientes → c:/Users/Usuario/Downloads/tienda_online/frontend-tiendaonline/frontend-apicrud/listado-clientes.html
```
- Carga automáticamente los 20 clientes desde BD
- Búsqueda en tiempo real
- Botones para editar
- Botón eliminar (solo visible si eres Admin)

**Crear Cliente:**
```
http://localhost/crear-cliente → c:/Users/Usuario/Downloads/tienda_online/frontend-tiendaonline/frontend-apicrud/crear-cliente.html
```
- Formulario con validación
- Campos: Nombre, Apellido, Email, Celular, Dirección, Dirección 2 (opcional)
- Botón "Crear Cliente"

**Editar Cliente:**
- Haz click en el botón "Editar" en la tabla de clientes
- Se carga el formulario con los datos del cliente
- El título cambia a "Editar Cliente"
- Modifica los datos y haz click en "Actualizar Cliente"

---

### 3️⃣ MÓDULO DE PRODUCTOS

**Ver Productos:**
```
c:/Users/Usuario/Downloads/tienda_online/frontend-tiendaonline/frontend-apicrud/listado-pro.html
```
- Tabla con todos los productos
- Búsqueda por nombre o descripción
- Acciones: Editar y Eliminar (solo Admin)

**Crear Producto:**
```
c:/Users/Usuario/Downloads/tienda_online/frontend-tiendaonline/frontend-apicrud/crear-pro.html
```
- Formulario: Nombre, Precio, Inventario, Descripción, URL Imagen
- Preview de imagen en tiempo real
- Validación de campos

---

### 4️⃣ SISTEMA DE ROLES

#### 👨‍💼 Administrador
- **Email:** admin@tienda.com
- **Contraseña:** admin123
- **Permisos:** Crear, Editar, Ver, ELIMINAR

#### 🧑‍💼 Vendedor
- **Email:** vendedor@tienda.com
- **Contraseña:** vendedor123
- **Permisos:** Crear, Editar, Ver (No puede eliminar)

---

### 5️⃣ VERIFICAR FUNCIONAMIENTO

#### Paso 1: Abrir la página de clientes
```
Archivo → Abrir → c:\Users\Usuario\Downloads\tienda_online\frontend-tiendaonline\frontend-apicrud\listado-clientes.html
```

#### Paso 2: Verificar carga de datos
✅ Deberías ver 20 clientes en la tabla
✅ Debe mostrar: #, Nombre, Apellido, Email, Celular, Dirección, Dirección 2, Acciones

#### Paso 3: Probar búsqueda
- Escribe un nombre en el buscador (ej: "Andrés")
- La tabla debe filtrar automáticamente

#### Paso 4: Probar crear cliente
- Haz click en "Crear Cliente"
- Rellena el formulario
- Haz click en "Crear Cliente"
- Deberías ver un mensaje de éxito
- Serás redirigido al listado

#### Paso 5: Probar editar cliente
- Haz click en "Editar" en un cliente
- Modifica algún campo
- Haz click en "Actualizar Cliente"
- Deberías ver un mensaje de éxito

#### Paso 6: Probar eliminar (solo Admin)
- Si eres Admin, verás botón "Eliminar"
- Si eres Vendedor, NO verás ese botón
- Si haces click, se pide confirmación
- Luego el cliente se elimina

---

### 6️⃣ CONSOLA DEL NAVEGADOR (F12)

Abre DevTools (F12) y revisa:

**Console:**
- Deberías ver mensajes de carga de clientes
- Si hay errores, se mostrarán aquí

**Network:**
- GET /api/clientes - Carga de clientes
- POST /api/clientes - Crear cliente
- PUT /api/clientes/:id - Editar cliente
- DELETE /api/clientes/:id - Eliminar cliente

**Application → LocalStorage:**
- `usuario` → Datos del usuario loggeado

---

### 7️⃣ COMANDOS API (Terminal)

#### Ver todos los clientes
```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/clientes | ConvertFrom-Json
```

#### Crear cliente (requiere Admin/Vendedor)
```powershell
$body = @{
    nombre = "Pedro"
    apellido = "González"
    email = "pedro@test.com"
    celular = "3001234567"
    direccion = "Calle Principal 123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/clientes `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "X-User-Role"="administrador"} `
    -Body $body
```

#### Obtener cliente específico
```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/clientes/1 | ConvertFrom-Json
```

#### Eliminar cliente (solo Admin)
```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/clientes/1 `
    -Method DELETE `
    -Headers @{"X-User-Role"="administrador"}
```

---

### 8️⃣ INFORMACIÓN DE LOS 20 CLIENTES

| ID | Nombre | Apellido | Email | Celular |
|----|--------|----------|-------|---------|
| 1 | Andrés | Martínez López | andres.martinez@gmail.com | 3001234567 |
| 2 | Laura | Gómez Ramírez | laura.gomez@gmail.com | 3012345678 |
| 3 | Carlos | Pérez Torres | carlos.perez@gmail.com | 3023456789 |
| 4 | Natalia | Rodríguez Mejía | natalia.rodriguez@gmail.com | 3034567890 |
| 5 | Juan David | Hernández López | juan.hernandez@gmail.com | 3045678901 |
| 6 | Mariana | Castro Gómez | mariana.castro@gmail.com | 3056789012 |
| 7 | Felipe | Restrepo Díaz | felipe.restrepo@gmail.com | 3067890123 |
| 8 | Valentina | Sánchez Ríos | valentina.sanchez@gmail.com | 3078901234 |
| 9 | Sebastián | Vargas López | sebastian.vargas@gmail.com | 3089012345 |
| 10 | Camila | Moreno García | camila.moreno@gmail.com | 3090123456 |
| 11 | Daniel | Ramírez Torres | daniel.ramirez@gmail.com | 3001234568 |
| 12 | Sofía | González Pérez | sofia.gonzalez@gmail.com | 3012345679 |
| 13 | Miguel Ángel | Cardona López | miguel.cardona@gmail.com | 3023456790 |
| 14 | Carolina | Jiménez Ruiz | carolina.jimenez@gmail.com | 3034567891 |
| 15 | Santiago | Herrera Gómez | santiago.herrera@gmail.com | 3045678902 |
| 16 | Daniela | Castaño López | daniela.castano@gmail.com | 3056789013 |
| 17 | Alejandro | Ríos Martínez | alejandro.rios@gmail.com | 3067890124 |
| 18 | Paula Andrea | Molina Sánchez | paula.molina@gmail.com | 3078901235 |
| 19 | Nicolás | Vélez Restrepo | nicolas.velez@gmail.com | 3089012346 |
| 20 | Juliana | Ospina García | juliana.ospina@gmail.com | 3090123457 |

---

### 9️⃣ ESTRUCTURA DE DIRECTORIOS

```
c:\Users\Usuario\Downloads\tienda_online\
├── BACKEND_TIENDA_ON_LINE\
│   └── BACKEND_TIENDA_NODE_MYSQL\
│       ├── src\
│       │   ├── controllers\
│       │   │   ├── clientesController.js ✅
│       │   │   ├── productosController.js ✅
│       │   │   └── ...
│       │   ├── routes\
│       │   │   ├── clientesRoutes.js ✅
│       │   │   ├── productosRoutes.js ✅
│       │   │   └── ...
│       │   ├── middleware\
│       │   │   └── auth.js ✅ (NUEVO)
│       │   └── database\
│       ├── server.js
│       └── package.json
└── frontend-tiendaonline\
    └── frontend-apicrud\
        ├── js\
        │   ├── clientes.js ✅ (NUEVO)
        │   ├── crear-cliente.js ✅ (NUEVO)
        │   ├── productos.js ✅ (NUEVO)
        │   ├── crear-pro.js ✅ (NUEVO)
        │   └── ...
        ├── listado-clientes.html ✅
        ├── crear-cliente.html ✅
        ├── listado-pro.html ✅
        ├── crear-pro.html ✅
        └── ...
```

---

### 🔟 SOLUCIÓN DE PROBLEMAS

**P: No aparecen los clientes en la tabla**
R: Verifica que:
   - El servidor Node.js esté corriendo (npm start)
   - La base de datos esté iniciada (XAMPP MySQL)
   - Abre la consola (F12) para ver errores

**P: El formulario no responde**
R: 
   - Recarga la página (Ctrl+F5)
   - Verifica que los scripts JavaScript se carguen (red tab)
   - Revisa la consola para errores

**P: No puedo eliminar clientes**
R: Solo Administrador puede eliminar
   - Verifica tu rol en localStorage (DevTools → Application)
   - Intenta con rol "administrador"

**P: El email dice que ya está registrado**
R: Email debe ser único
   - Modifica el email del cliente
   - O elimina el cliente anterior (si eres Admin)

---

### ✅ VERIFICACIÓN FINAL

- [ ] Clientes se cargan correctamente (20 en total)
- [ ] Búsqueda funciona en tiempo real
- [ ] Puedes crear un cliente nuevo
- [ ] Puedes editar un cliente existente
- [ ] Los Admin pueden eliminar clientes
- [ ] Los Vendedores no ven botón eliminar
- [ ] Mensajes de éxito/error se muestran correctamente
- [ ] La tabla se actualiza automáticamente después de cada acción
- [ ] Los datos persisten en la base de datos

---

¡Listo! Tu módulo de clientes está 100% funcional y conectado a la base de datos. 🎉
