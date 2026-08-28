// ==================== MÓDULO DE CLIENTES ====================
// Script para gestionar la lista de clientes con búsqueda y acciones

const API_BASE = 'http://localhost:3000/api';
let usuarioActual = null;
let clientesActuales = [];

// Cargar usuario desde localStorage
function cargarUsuarioActual() {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
        usuarioActual = JSON.parse(usuario);
    } else {
        window.location.href = 'login.html';
    }
}

// Obtener todos los clientes
async function cargarClientes() {
    try {
        const response = await fetch(`${API_BASE}/clientes`);
        if (!response.ok) throw new Error('Error al cargar clientes');
        
        clientesActuales = await response.json();
        mostrarClientes(clientesActuales);
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar clientes', 'error');
    }
}

// Mostrar clientes en la tabla
function mostrarClientes(clientes) {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (clientes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No hay clientes registrados</td></tr>`;
        return;
    }
    
    clientes.forEach((cliente, index) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <th scope="row">${index + 1}</th>
            <td>${cliente.nombre}</td>
            <td>${cliente.apellido}</td>
            <td>${cliente.email}</td>
            <td>${cliente.celular}</td>
            <td>${cliente.direccion}</td>
            <td>${cliente.direccion2 || '-'}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editarCliente(${cliente.id_cliente})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                ${usuarioActual.rol === 'administrador' ? `
                <button class="btn btn-sm btn-danger" onclick="eliminarCliente(${cliente.id_cliente})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
                ` : ''}
            </td>
        `;
        tbody.appendChild(fila);
    });
}

// Buscar clientes por nombre, apellido, email o celular
function buscarClientes() {
    const searchInput = document.querySelector('input[placeholder="Buscar Cliente"]');
    if (!searchInput) return;
    
    const termino = searchInput.value.toLowerCase();
    
    const resultados = clientesActuales.filter(cliente => 
        cliente.nombre.toLowerCase().includes(termino) ||
        cliente.apellido.toLowerCase().includes(termino) ||
        cliente.email.toLowerCase().includes(termino) ||
        cliente.celular.includes(termino)
    );
    
    mostrarClientes(resultados);
}

// Editar cliente
function editarCliente(id) {
    // Guardar el ID en sessionStorage y redirigir
    sessionStorage.setItem('cliente_a_editar', id);
    window.location.href = 'editar-cliente.html';
}

// Eliminar cliente (solo administrador)
async function eliminarCliente(id) {
    if (usuarioActual.rol !== 'administrador') {
        mostrarAlerta('No tienes permisos para eliminar clientes', 'warning');
        return;
    }
    
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/clientes/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Role': usuarioActual.rol,
                'X-User-ID': usuarioActual.id
            }
        });
        
        if (!response.ok) throw new Error('Error al eliminar cliente');
        
        mostrarAlerta('Cliente eliminado correctamente', 'success');
        await cargarClientes();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al eliminar cliente', 'error');
    }
}

// Mostrar alertas
function mostrarAlerta(mensaje, tipo = 'info') {
    // Crear elemento de alerta
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo === 'error' ? 'danger' : tipo} alert-dismissible fade show position-fixed`;
    alerta.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alerta.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alerta);
    
    // Desaparecer después de 5 segundos
    setTimeout(() => alerta.remove(), 5000);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    cargarUsuarioActual();
    cargarClientes();
    
    // Agregar listener para búsqueda
    const searchInput = document.querySelector('input[placeholder="Buscar Cliente"]');
    if (searchInput) {
        searchInput.addEventListener('input', buscarClientes);
    }
});
