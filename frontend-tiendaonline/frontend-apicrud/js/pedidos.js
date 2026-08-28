const API_BASE = 'http://localhost:3000/api';
const ESTADOS = ['Pendiente', 'Confirmado', 'En preparación', 'En camino', 'Entregado', 'Cancelado'];
let pedidosActuales = [];
let usuarioActual = null;

function cargarUsuario() {
    try {
        usuarioActual = JSON.parse(localStorage.getItem('usuario') || 'null');
    } catch {
        usuarioActual = null;
    }
    if (!usuarioActual) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function formatoCOP(valor) {
    return `$${Number(valor || 0).toLocaleString('es-CO')}`;
}

function escaparHTML(valor) {
    return String(valor ?? '').replace(/[&<>'"]/g, caracter => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[caracter]);
}

function mostrarAlerta(mensaje, tipo = 'info') {
    const contenedor = document.getElementById('alertas-pedidos');
    if (!contenedor) return;
    contenedor.innerHTML = `<div class="alert alert-${tipo === 'error' ? 'danger' : tipo} alert-dismissible fade show" role="alert">
        ${escaparHTML(mensaje)}<button type="button" class="close" data-dismiss="alert" aria-label="Cerrar"><span aria-hidden="true">&times;</span></button>
    </div>`;
}

async function solicitar(url, opciones = {}) {
    const respuesta = await fetch(url, {
        ...opciones,
        headers: {
            'Content-Type': 'application/json',
            'X-User-Role': usuarioActual?.rol || '',
            'X-User-ID': usuarioActual?.id || '',
            ...(opciones.headers || {})
        }
    });
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) throw new Error(datos.message || 'No se pudo completar la operación');
    return datos;
}

function badgeEstado(estado) {
    const clases = {
        'Pendiente': 'badge-warning', 'Confirmado': 'badge-primary',
        'En preparación': 'badge-info', 'En camino': 'badge-secondary',
        'Entregado': 'badge-success', 'Cancelado': 'badge-danger'
    };
    return `<span class="badge ${clases[estado] || 'badge-secondary'}">${escaparHTML(estado || 'Pendiente')}</span>`;
}

function opcionesEstado(estado) {
    return ESTADOS.map(opcion => `<option value="${escaparHTML(opcion)}" ${opcion === estado ? 'selected' : ''}>${escaparHTML(opcion)}</option>`).join('');
}

function renderizarPedidos(lista) {
    const tabla = document.getElementById('tabla-pedidos');
    if (!tabla) return;
    if (!lista.length) {
        tabla.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-4">No hay pedidos registrados</td></tr>';
        return;
    }
    tabla.innerHTML = lista.map(pedido => `
        <tr>
            <th scope="row">${pedido.id}</th>
            <td>${escaparHTML(`${pedido.nombre || ''} ${pedido.apellido || ''}`.trim())}</td>
            <td>${escaparHTML(pedido.email || '-')}</td>
            <td>${new Date(pedido.fecha).toLocaleString('es-CO')}</td>
            <td>${formatoCOP(pedido.subtotal)}</td>
            <td>${formatoCOP(pedido.aumento)}</td>
            <td>${formatoCOP(pedido.descuento)}</td>
            <td><strong>${formatoCOP(pedido.total)}</strong></td>
            <td>${badgeEstado(pedido.estado)}</td>
            <td class="text-nowrap">
                <button class="btn btn-sm btn-info" onclick="verDetallePedido(${pedido.id})" title="Ver detalle"><i class="fas fa-eye"></i></button>
                <select class="form-control form-control-sm d-inline-block ml-1" style="width: 135px" onchange="cambiarEstadoPedido(${pedido.id}, this.value)" ${['Entregado', 'Cancelado'].includes(pedido.estado) ? 'disabled' : ''}>
                    ${opcionesEstado(pedido.estado)}
                </select>
                ${usuarioActual?.rol === 'administrador' ? `<button class="btn btn-sm btn-danger ml-1" onclick="eliminarPedido(${pedido.id})" title="Eliminar"><i class="fas fa-trash"></i></button>` : ''}
            </td>
        </tr>`).join('');
}

async function cargarPedidos() {
    const tabla = document.getElementById('tabla-pedidos');
    if (tabla) tabla.innerHTML = '<tr><td colspan="10" class="text-center py-4">Cargando pedidos...</td></tr>';
    try {
        pedidosActuales = await solicitar(`${API_BASE}/pedidos`);
        renderizarPedidos(pedidosActuales);
    } catch (error) {
        mostrarAlerta(error.message, 'error');
        if (tabla) tabla.innerHTML = '<tr><td colspan="10" class="text-center text-danger py-4">No se pudieron cargar los pedidos</td></tr>';
    }
}

async function verDetallePedido(id) {
    const contenido = document.getElementById('detalle-pedido-contenido');
    try {
        const pedido = await solicitar(`${API_BASE}/pedidos/${id}`);
        const subtotal = Number(pedido.subtotal || 0);
        const detalles = pedido.detalles || [];
        contenido.innerHTML = `
            <p><strong>Pedido #${pedido.id}</strong> | ${new Date(pedido.fecha).toLocaleString('es-CO')}</p>
            <p><strong>Cliente:</strong> ${escaparHTML(`${pedido.nombre || ''} ${pedido.apellido || ''}`)}<br><strong>Email:</strong> ${escaparHTML(pedido.email || '-')}</p>
            <div class="table-responsive"><table class="table table-sm"><thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th>Subtotal</th></tr></thead><tbody>
                ${detalles.map(detalle => `<tr><td>${escaparHTML(detalle.producto_nombre)}</td><td>${detalle.cantidad}</td><td>${formatoCOP(detalle.precio)}</td><td>${formatoCOP(detalle.subtotal_producto || Number(detalle.precio) * Number(detalle.cantidad))}</td></tr>`).join('')}
            </tbody></table></div>
            <div class="text-right"><p>Subtotal: <strong>${formatoCOP(subtotal)}</strong></p><p>Envío: <strong>${formatoCOP(pedido.aumento)}</strong></p><p>Descuento: <strong>-${formatoCOP(pedido.descuento)}</strong></p><h4>Total: ${formatoCOP(pedido.total)}</h4><p>Estado: ${badgeEstado(pedido.estado)}</p></div>`;
        $('#detallePedidoModal').modal('show');
    } catch (error) {
        mostrarAlerta(error.message, 'error');
    }
}

async function cambiarEstadoPedido(id, estado) {
    try {
        await solicitar(`${API_BASE}/pedidos/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) });
        mostrarAlerta('Estado actualizado correctamente', 'success');
        await cargarPedidos();
    } catch (error) {
        mostrarAlerta(error.message, 'error');
        await cargarPedidos();
    }
}

async function eliminarPedido(id) {
    if (!confirm(`¿Deseas eliminar el pedido #${id}? Esta acción no se puede deshacer.`)) return;
    try {
        await solicitar(`${API_BASE}/pedidos/${id}`, { method: 'DELETE' });
        mostrarAlerta('Pedido eliminado correctamente', 'success');
        await cargarPedidos();
    } catch (error) {
        mostrarAlerta(error.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!cargarUsuario()) return;
    cargarPedidos();
    const buscador = document.querySelector('input[placeholder="Buscar Pedido"]');
    buscador?.addEventListener('input', event => {
        const termino = event.target.value.toLowerCase();
        renderizarPedidos(pedidosActuales.filter(pedido => `${pedido.id} ${pedido.nombre} ${pedido.apellido} ${pedido.email} ${pedido.estado}`.toLowerCase().includes(termino)));
    });
});
