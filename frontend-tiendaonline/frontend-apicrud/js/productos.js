// ==================== MÓDULO DE PRODUCTOS ====================
// Script para gestionar la lista de productos con búsqueda y acciones

const API_BASE = 'http://localhost:3000/api';
let usuarioActual = null;
let productosActuales = [];

function formatoCOP(valor) {
    return `$${Number(valor || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// Cargar usuario desde localStorage
function cargarUsuarioActual() {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
        usuarioActual = JSON.parse(usuario);
    } else {
        window.location.href = 'login.html';
    }
}

// Obtener todos los productos
async function cargarProductos() {
    try {
        const response = await fetch(`${API_BASE}/productos`);
        if (!response.ok) throw new Error('Error al cargar productos');
        
        productosActuales = await response.json();
        mostrarProductos(productosActuales);
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar productos', 'error');
    }
}

// Mostrar productos en la tabla
function mostrarProductos(productos) {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No hay productos registrados</td></tr>`;
        return;
    }
    
    productos.forEach((producto, index) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <th scope="row">${index + 1}</th>
            <td>${producto.nombre}</td>
            <td>${formatoCOP(producto.precio)} COP</td>
            <td>${producto.stock}</td>
            <td>${producto.descripcion || '-'}</td>
            <td class="text-center">
                ${producto.imagen ? `<img src="${producto.imagen}" alt="${producto.nombre}" class="img-thumbnail" style="width: 80px; height: 80px; object-fit: cover;" onerror="this.onerror=null; this.src='img/undraw_posting_photo.svg';">` : '<span class="text-muted">Sin imagen</span>'}
            </td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editarProducto(${producto.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                ${usuarioActual.rol === 'administrador' ? `
                <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${producto.id})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
                ` : ''}
            </td>
        `;
        tbody.appendChild(fila);
    });
}

// Buscar productos
function buscarProductos() {
    const searchInput = document.querySelector('input[placeholder="Buscar..."]');
    if (!searchInput) return;
    
    const termino = searchInput.value.toLowerCase();
    
    const resultados = productosActuales.filter(producto => 
        producto.nombre.toLowerCase().includes(termino) ||
        (producto.descripcion && producto.descripcion.toLowerCase().includes(termino))
    );
    
    mostrarProductos(resultados);
}

// Editar producto
function editarProducto(id) {
    sessionStorage.setItem('producto_a_editar', id);
    window.location.href = 'crear-pro.html';
}

// Eliminar producto (solo administrador)
async function eliminarProducto(id) {
    if (usuarioActual.rol !== 'administrador') {
        mostrarAlerta('No tienes permisos para eliminar productos', 'warning');
        return;
    }
    
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/productos/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Role': usuarioActual.rol,
                'X-User-ID': usuarioActual.id
            }
        });
        
        if (!response.ok) throw new Error('Error al eliminar producto');
        
        mostrarAlerta('Producto eliminado correctamente', 'success');
        await cargarProductos();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al eliminar producto', 'error');
    }
}

// Mostrar alertas
function mostrarAlerta(mensaje, tipo = 'info') {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo === 'error' ? 'danger' : tipo} alert-dismissible fade show position-fixed`;
    alerta.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alerta.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 5000);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    cargarUsuarioActual();
    cargarProductos();
    
    // Agregar listener para búsqueda
    const searchInput = document.querySelector('input[placeholder="Buscar..."]');
    if (searchInput) {
        searchInput.addEventListener('input', buscarProductos);
    }
});
