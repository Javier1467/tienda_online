// ==================== CREAR PRODUCTO ====================
// Script para manejar el formulario de creación de producto

const API_BASE = 'http://localhost:3000/api';
let usuarioActual = null;
let productoAEditar = null;

// Cargar todos los productos en el selector de productos existentes
async function cargarProductosDisponibles() {
    const selector = document.getElementById('selector-productos');
    if (!selector) return;

    try {
        const response = await fetch(`${API_BASE}/productos`);
        if (!response.ok) throw new Error('Error al cargar productos');

        const productos = await response.json();
        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = `${producto.nombre} - $${parseFloat(producto.precio).toLocaleString('es-CO')} - Stock: ${producto.stock}`;
            selector.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('No se pudieron cargar los productos disponibles', 'error');
    }
}

// Seleccionar un producto existente para editarlo
async function seleccionarProducto(event) {
    const productoId = event.target.value;

    if (!productoId) {
        productoAEditar = null;
        document.getElementById('formulario-producto').reset();
        document.querySelector('h1').textContent = 'Crear Producto';
        document.querySelector('#formulario-producto button[type="submit"]').textContent = 'Crear Producto';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/productos/${productoId}`);
        if (!response.ok) throw new Error('Error al cargar producto');

        productoAEditar = await response.json();
        rellenarFormulario(productoAEditar);
        document.querySelector('h1').textContent = 'Editar Producto';
        document.querySelector('#formulario-producto button[type="submit"]').textContent = 'Actualizar Producto';
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('No se pudo cargar el producto seleccionado', 'error');
    }
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

// Cargar datos del producto para editar (si aplica)
async function cargarProductoParaEditar() {
    const productoId = sessionStorage.getItem('producto_a_editar');
    
    if (productoId) {
        try {
            const response = await fetch(`${API_BASE}/productos/${productoId}`);
            if (!response.ok) throw new Error('Error al cargar producto');
            
            productoAEditar = await response.json();
            rellenarFormulario(productoAEditar);
            
            // Cambiar título y botón
            document.querySelector('h1').textContent = 'Editar Producto';
            document.querySelector('button[type="submit"]').textContent = 'Actualizar Producto';
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('Error al cargar producto', 'error');
        }
    }
}

// Rellenar formulario con datos del producto
function rellenarFormulario(producto) {
    document.getElementById('nombre-pro').value = producto.nombre;
    document.getElementById('descripcion-pro').value = producto.descripcion || '';
    document.getElementById('precio-pro').value = producto.precio;
    document.getElementById('stock-pro').value = producto.stock;
    document.getElementById('imagen-pro').value = producto.imagen || '';
    actualizarVistaPrevia(producto.imagen || '');
}

function actualizarVistaPrevia(url) {
    const preview = document.getElementById('imagen-preview-pro');
    if (!preview) return;
    preview.src = url || 'img/undraw_posting_photo.svg';
    preview.alt = url ? 'Vista previa del producto' : 'Sin imagen';
}

// Validar formulario
function validarFormulario(datos) {
    const errores = [];
    
    if (!datos.nombre || datos.nombre.trim() === '') {
        errores.push('El nombre es requerido');
    }
    
    if (!Number.isFinite(datos.precio) || datos.precio < 0) {
        errores.push('El precio debe ser un número mayor o igual a cero');
    }
    
    if (!Number.isInteger(datos.stock) || datos.stock < 0) {
        errores.push('El inventario debe ser un número entero mayor o igual a cero');
    }
    
    return errores;
}

// Manejar envío del formulario
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const datos = {
        nombre: document.getElementById('nombre-pro').value.trim(),
        descripcion: document.getElementById('descripcion-pro').value.trim() || '',
        precio: Number(document.getElementById('precio-pro').value),
        stock: Number(document.getElementById('stock-pro').value),
        imagen: document.getElementById('imagen-pro').value.trim() || ''
    };
    
    // Validar
    const errores = validarFormulario(datos);
    if (errores.length > 0) {
        mostrarAlerta(errores.join(', '), 'error');
        return;
    }
    
    try {
        let response;
        let mensaje;
        
        if (productoAEditar) {
            // Actualizar producto existente
            response = await fetch(`${API_BASE}/productos/${productoAEditar.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Role': usuarioActual.rol,
                    'X-User-ID': usuarioActual.id
                },
                body: JSON.stringify(datos)
            });
            mensaje = 'Producto actualizado correctamente';
        } else {
            // Crear nuevo producto
            response = await fetch(`${API_BASE}/productos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Role': usuarioActual.rol,
                    'X-User-ID': usuarioActual.id
                },
                body: JSON.stringify(datos)
            });
            mensaje = 'Producto creado correctamente';
        }
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error en la operación');
        }
        
        mostrarAlerta(mensaje, 'success');
        
        // Limpiar sessionStorage y redirigir
        sessionStorage.removeItem('producto_a_editar');
        setTimeout(() => {
            window.location.href = 'listado-pro.html';
        }, 1500);
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta(error.message || 'Error al guardar producto', 'error');
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
    cargarProductosDisponibles();
    cargarProductoParaEditar();

    const selector = document.getElementById('selector-productos');
    if (selector) {
        selector.addEventListener('change', seleccionarProducto);
    }
    
    // Agregar listener al formulario
    const form = document.getElementById('formulario-producto');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    document.getElementById('imagen-pro')?.addEventListener('input', event => {
        actualizarVistaPrevia(event.target.value.trim());
    });
});
