// ==================== MIDDLEWARE DE AUTENTICACIÓN ====================
// Middleware para verificar permisos del usuario

// Verificar que el usuario sea administrador para eliminar
const verificarAdmin = (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    
    if (userRole !== 'administrador') {
        return res.status(403).json({ 
            message: 'No tienes permiso para realizar esta acción. Solo administradores pueden eliminar.' 
        });
    }
    
    next();
};

// Verificar que el usuario sea vendedor o administrador para crear/editar
const verificarVendedorOAdmin = (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    
    if (userRole !== 'vendedor' && userRole !== 'administrador') {
        return res.status(403).json({ 
            message: 'No tienes permiso para realizar esta acción. Se requiere rol vendedor o administrador.' 
        });
    }
    
    next();
};

// Middleware para logging de operaciones
const logOperacion = (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];
    const metodo = req.method;
    const ruta = req.path;
    
    console.log(`[${new Date().toISOString()}] ${metodo} ${ruta} - Usuario: ${userId} (${userRole})`);
    
    next();
};

module.exports = {
    verificarAdmin,
    verificarVendedorOAdmin,
    logOperacion
};
