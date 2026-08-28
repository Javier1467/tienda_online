// ==================== MÓDULO DE PEDIDOS ====================
// Script para gestionar la creación de pedidos con productos dinámicos

const API_BASE = 'http://localhost:3000/api';
let usuarioActual = null;
let clientesDisponibles = [];
let productosDisponibles = [];
let carrito = [];

// Cargar usuario desde localStorage
function cargarUsuarioActual() {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
        usuarioActual = JSON.parse(usuario);
    } else {
        window.location.href = 'login.html';
    }
}

// Cargar clientes en el selector
async function cargarClientes() {
    try {
        const response = await fetch(`${API_BASE}/clientes`, {
            headers: {
                'X-User-Role': usuarioActual?.rol || 'vendedor',
                'X-User-ID': usuarioActual?.id || 1
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar clientes');
        
        clientesDisponibles = await response.json();
        const selectCliente = document.getElementById('id_cliente');
        
        clientesDisponibles.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id_cliente;
            option.textContent = `${cliente.nombre} ${cliente.apellido} - ${cliente.email}`;
            selectCliente.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        mostrarAlerta('Error al cargar clientes', 'error');
    }
}

// Cargar productos en el selector
async function cargarProductos() {
    try {
        const response = await fetch(`${API_BASE}/productos`, {
            headers: {
                'X-User-Role': usuarioActual?.rol || 'vendedor',
                'X-User-ID': usuarioActual?.id || 1
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar productos');
        
        productosDisponibles = await response.json();
        
        const selectProducto = document.getElementById('selector-productos');
        if (!selectProducto) return;

        productosDisponibles.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = `${producto.nombre} - $${parseFloat(producto.precio).toLocaleString('es-CO')} - Stock: ${producto.stock}`;
            option.dataset.precio = producto.precio;
            option.dataset.stock = producto.stock;
            selectProducto.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarAlerta('Error al cargar productos', 'error');
    }
}

// Agregar producto al carrito
function agregarAlCarrito() {
    const selectProducto = document.getElementById('selector-productos');
    const productoId = selectProducto.value;
    
    if (!productoId) {
        mostrarAlerta('Por favor selecciona un producto', 'warning');
        return;
    }
    
    const producto = productosDisponibles.find(p => p.id == productoId);
    if (!producto) return;
    
    // Verificar si ya existe en el carrito
    const itemCarrito = carrito.find(item => item.id === producto.id);
    
    if (itemCarrito) {
        if (itemCarrito.cantidad >= itemCarrito.stock) {
            mostrarAlerta(`No hay más stock disponible. Disponible: ${itemCarrito.stock}`, 'warning');
            return;
        }
        itemCarrito.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: parseFloat(producto.precio),
            cantidad: 1,
            stock: producto.stock
        });
    }
    
    actualizarCarrito();
    selectProducto.value = '';
    mostrarAlerta(`${producto.nombre} agregado al carrito`, 'success');
}

// Actualizar tabla del carrito
function actualizarCarrito() {
    const tbody = document.querySelector('#tabla-carrito tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    let total = 0;
    
    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${item.nombre}</td>
            <td>$${item.precio.toLocaleString('es-CO')}</td>
            <td>
                <input type="number" value="${item.cantidad}" min="1" max="${item.stock}" 
                    onchange="cambiarCantidad(${item.id}, this.value)" class="form-control" style="width: 60px;">
            </td>
            <td>$${subtotal.toLocaleString('es-CO')}</td>
            <td>
                <button type="button" class="btn btn-danger btn-sm" onclick="eliminarDelCarrito(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
    
    actualizarTotal(total);
}

// Cambiar cantidad de producto en carrito
function cambiarCantidad(productoId, nuevaCantidad) {
    const item = carrito.find(i => i.id === productoId);
    if (item) {
        const cantidad = parseInt(nuevaCantidad);
        if (cantidad > 0 && cantidad <= item.stock) {
            item.cantidad = cantidad;
            actualizarCarrito();
        } else {
            mostrarAlerta(`No hay stock suficiente. Disponible: ${item.stock}`, 'warning');
            actualizarCarrito();
        }
    }
}

// Eliminar producto del carrito
function eliminarDelCarrito(productoId) {
    carrito = carrito.filter(item => item.id !== productoId);
    actualizarCarrito();
    mostrarAlerta('Producto eliminado del carrito', 'info');
}

// Actualizar total
function actualizarTotal(subtotal) {
    const descuento = parseFloat(document.getElementById('descuento').value) || 0;
    const aumento = parseFloat(document.getElementById('aumento').value) || 0;
    const total = Math.max(0, subtotal - descuento + aumento);

    document.getElementById('subtotal-pedido').textContent = `$${subtotal.toLocaleString('es-CO')}`;
    document.getElementById('envio-pedido').textContent = `$${aumento.toLocaleString('es-CO')}`;
    document.getElementById('descuento-pedido').textContent = `-$${descuento.toLocaleString('es-CO')}`;
    document.getElementById('total-pedido').textContent = `$${total.toLocaleString('es-CO')}`;

    return { subtotal, descuento, aumento, total };
}

function obtenerSubtotal() {
    return carrito.reduce((subtotal, item) => subtotal + item.precio * item.cantidad, 0);
}

// Manejar cambios en descuento y aumento
document.addEventListener('DOMContentLoaded', function() {
    cargarUsuarioActual();
    cargarClientes();
    cargarProductos();

    document.getElementById('agregar-producto')?.addEventListener('click', agregarAlCarrito);
    
    // Event listeners para descuento y aumento
    document.getElementById('descuento')?.addEventListener('input', () => {
        actualizarTotal(obtenerSubtotal());
    });
    
    document.getElementById('aumento')?.addEventListener('input', () => {
        actualizarTotal(obtenerSubtotal());
    });
    
    // Manejar envío del formulario
    document.getElementById('formulario-pedido')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (carrito.length === 0) {
            mostrarAlerta('Agrega al menos un producto al carrito', 'warning');
            return;
        }
        
        const idCliente = document.getElementById('id_cliente').value;
        const metodoPago = document.getElementById('metodo_pago').value;
        const descuento = parseFloat(document.getElementById('descuento').value) || 0;
        const aumento = parseFloat(document.getElementById('aumento').value) || 0;

        if (!idCliente || !metodoPago) {
            mostrarAlerta('Selecciona un cliente y un método de pago', 'warning');
            return;
        }

        if (!Number.isFinite(descuento) || descuento < 0 || !Number.isFinite(aumento) || aumento < 0) {
            mostrarAlerta('El descuento y el costo de envío deben ser valores válidos', 'warning');
            return;
        }

        actualizarTotal(obtenerSubtotal());
        
        const datoPedido = {
            id_cliente: idCliente,
            metodo_pago: metodoPago,
            descuento: descuento,
            aumento: aumento,
            productos: carrito.map(item => ({
                id_producto: item.id,
                cantidad: item.cantidad,
                precio: item.precio
            }))
        };
        
        try {
            const response = await fetch(`${API_BASE}/pedidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Role': usuarioActual?.rol || 'vendedor',
                    'X-User-ID': usuarioActual?.id || 1
                },
                body: JSON.stringify(datoPedido)
            });
            
            if (response.ok) {
                mostrarAlerta('Pedido creado exitosamente', 'success');
                setTimeout(() => {
                    window.location.href = 'listado-pedidos.html';
                }, 1500);
            } else {
                const error = await response.json();
                mostrarAlerta(error.message || 'Error al crear el pedido', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('Error al crear el pedido', 'error');
        }
    });
});

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo = 'info') {
    const alertaDiv = document.createElement('div');
    alertaDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
    alertaDiv.role = 'alert';
    alertaDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    
    const contenedor = document.querySelector('.container-fluid');
    if (contenedor && contenedor.firstChild) {
        contenedor.insertBefore(alertaDiv, contenedor.firstChild.nextSibling);
        setTimeout(() => alertaDiv.remove(), 4000);
    }
}
