// Script de verificación para los 7 productos nuevos
// Copia esto en la consola del navegador (F12) en listado-pro.html

async function verificarProductos() {
    console.log('🔍 Verificando carga de los 7 productos nuevos...\n');
    
    try {
        // Obtener productos desde la API
        const response = await fetch('http://localhost:3000/api/productos', {
            headers: {
                'X-User-Role': 'administrador',
                'X-User-ID': '1'
            }
        });
        
        const productos = await response.json();
        console.log(`✅ Total de productos en BD: ${productos.length}`);
        console.log('');
        
        // Verificar los 7 nuevos
        const nuevosProductos = [
            'Milanesa de Pollo',
            'Enchiladas Verdes',
            'Fajitas de Carne',
            'Ceviche de Camarón',
            'Tacos de Carnitas',
            'Ropa Vieja',
            'Sopa de Mariscos'
        ];
        
        console.log('📋 Los 7 productos nuevos en la BD:');
        nuevosProductos.forEach((nombre, index) => {
            const producto = productos.find(p => p.nombre === nombre);
            if (producto) {
                console.log(`   ✅ [${producto.id}] ${producto.nombre}`);
                console.log(`       - Precio: $${producto.precio}`);
                console.log(`       - Stock: ${producto.stock}`);
                console.log(`       - Descripción: ${producto.descripcion.substring(0, 50)}...`);
            } else {
                console.log(`   ❌ ${nombre} NO ENCONTRADO`);
            }
        });
        
        console.log('\n📊 Conteo:');
        const conteoNuevos = nuevosProductos.filter(nombre => 
            productos.some(p => p.nombre === nombre)
        ).length;
        console.log(`   ${conteoNuevos}/7 productos nuevos encontrados ✅`);
        
        // Verificar que aparecen en la tabla del DOM
        const tbody = document.querySelector('table tbody');
        if (tbody) {
            const filas = tbody.querySelectorAll('tr');
            console.log(`\n📌 Filas en tabla DOM: ${filas.length}`);
            if (filas.length === productos.length) {
                console.log('   ✅ La tabla del DOM coincide con los productos de la BD');
            } else {
                console.log('   ⚠️  Cantidad de filas no coincide');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Ejecutar verificación
verificarProductos();
