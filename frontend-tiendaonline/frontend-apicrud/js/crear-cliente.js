// ==================== CREAR CLIENTE ====================
// Script para manejar el formulario de creación de cliente

const API_BASE = 'http://localhost:3000/api';
let usuarioActual = null;
let clienteAEditar = null;

// Cargar usuario desde localStorage
function cargarUsuarioActual() {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
        usuarioActual = JSON.parse(usuario);
    } else {
        window.location.href = 'login.html';
    }
}

// Cargar datos del cliente para editar (si aplica)
async function cargarClienteParaEditar() {
    const clienteId = sessionStorage.getItem('cliente_a_editar');
    
    if (clienteId) {
        try {
            const response = await fetch(`${API_BASE}/clientes/${clienteId}`);
            if (!response.ok) throw new Error('Error al cargar cliente');
            
            clienteAEditar = await response.json();
            rellenarFormulario(clienteAEditar);
            
            // Cambiar título y botón
            document.querySelector('h1').textContent = 'Editar Cliente';
            document.querySelector('button[type="submit"]').textContent = 'Actualizar Cliente';
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('Error al cargar cliente', 'error');
        }
    }
}

// Rellenar formulario con datos del cliente
function rellenarFormulario(cliente) {
    document.getElementById('nombre-cli').value = cliente.nombre;
    document.getElementById('apellido-cli').value = cliente.apellido;
    document.getElementById('email-cli').value = cliente.email;
    document.getElementById('celular-cli').value = cliente.celular;
    document.getElementById('direccion-cli').value = cliente.direccion;
    document.getElementById('direccion2-cli').value = cliente.direccion2 || '';
    document.getElementById('descripcion-cli').value = cliente.descripcion || '';
}

// Validar formulario
function validarFormulario(datos) {
    const errores = [];
    
    if (!datos.nombre || datos.nombre.trim() === '') {
        errores.push('El nombre es requerido');
    }
    
    if (!datos.apellido || datos.apellido.trim() === '') {
        errores.push('El apellido es requerido');
    }
    
    if (!datos.email || datos.email.trim() === '') {
        errores.push('El email es requerido');
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
        errores.push('El email no es válido');
    }
    
    if (!datos.celular || datos.celular.trim() === '') {
        errores.push('El celular es requerido');
    }
    
    if (!datos.direccion || datos.direccion.trim() === '') {
        errores.push('La dirección es requerida');
    }
    
    return errores;
}

// Manejar envío del formulario
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const datos = {
        nombre: document.getElementById('nombre-cli').value.trim(),
        apellido: document.getElementById('apellido-cli').value.trim(),
        email: document.getElementById('email-cli').value.trim(),
        celular: document.getElementById('celular-cli').value.trim(),
        direccion: document.getElementById('direccion-cli').value.trim(),
        direccion2: document.getElementById('direccion2-cli').value.trim() || null,
        descripcion: document.getElementById('descripcion-cli').value.trim() || null
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
        
        if (clienteAEditar) {
            // Actualizar cliente existente
            response = await fetch(`${API_BASE}/clientes/${clienteAEditar.id_cliente}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Role': usuarioActual.rol,
                    'X-User-ID': usuarioActual.id
                },
                body: JSON.stringify(datos)
            });
            mensaje = 'Cliente actualizado correctamente';
        } else {
            // Crear nuevo cliente
            response = await fetch(`${API_BASE}/clientes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Role': usuarioActual.rol,
                    'X-User-ID': usuarioActual.id
                },
                body: JSON.stringify(datos)
            });
            mensaje = 'Cliente creado correctamente';
        }
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error en la operación');
        }
        
        mostrarAlerta(mensaje, 'success');
        
        // Limpiar sessionStorage y redirigir
        sessionStorage.removeItem('cliente_a_editar');
        setTimeout(() => {
            window.location.href = 'listado-clientes.html';
        }, 1500);
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta(error.message || 'Error al guardar cliente', 'error');
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
    cargarClienteParaEditar();
    
    // Agregar listener al formulario
    const form = document.getElementById('formulario-cliente');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});
