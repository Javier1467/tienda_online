// Script para insertar 7 productos nuevos en la tabla productos
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tienda_online',
};

async function insertarProductos() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // 7 productos nuevos
    const productos = [
      {
        nombre: 'Milanesa de Pollo',
        descripcion: 'Milanesa crujiente de pollo con puré y ensalada fresca',
        precio: 25000,
        stock: 18,
        imagen: 'https://images.unsplash.com/photo-1588195538326-c5b1e6f3a30e?w=300'
      },
      {
        nombre: 'Enchiladas Verdes',
        descripcion: 'Enchiladas rellenas de queso oaxaca y pollo con salsa verde picante',
        precio: 28000,
        stock: 14,
        imagen: 'https://images.unsplash.com/photo-1585238341710-4b4e6ceaf799?w=300'
      },
      {
        nombre: 'Fajitas de Carne',
        descripcion: 'Fajitas de carne asada con cebolla, pimientos y tortillas calientes',
        precio: 32000,
        stock: 10,
        imagen: 'https://images.unsplash.com/photo-1598630156978-f0b0b41e9b4b?w=300'
      },
      {
        nombre: 'Ceviche de Camarón',
        descripcion: 'Ceviche de camarón fresco marinado con limón, aguacate y cilantro',
        precio: 35000,
        stock: 8,
        imagen: 'https://images.unsplash.com/photo-1630384478456-5ef868c7ef0f?w=300'
      },
      {
        nombre: 'Tacos de Carnitas',
        descripcion: 'Tacos de carnitas de cerdo con piña, cebolla morada y salsa roja',
        precio: 20000,
        stock: 22,
        imagen: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300'
      },
      {
        nombre: 'Ropa Vieja',
        descripcion: 'Carne de res deshilachada con cebolla, pimientos y especias cubanas',
        precio: 27000,
        stock: 12,
        imagen: 'https://images.unsplash.com/photo-1554080211-8325e6d78922?w=300'
      },
      {
        nombre: 'Sopa de Mariscos',
        descripcion: 'Sopa deliciosa con camarones, pulpo, mejillones y peces variados',
        precio: 30000,
        stock: 9,
        imagen: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300'
      }
    ];

    console.log('🔄 Insertando 7 productos nuevos...\n');

    let contador = 0;
    for (const producto of productos) {
      try {
        const [result] = await connection.execute(
          'INSERT INTO productos (nombre, descripcion, precio, stock, imagen) VALUES (?, ?, ?, ?, ?)',
          [producto.nombre, producto.descripcion, producto.precio, producto.stock, producto.imagen]
        );

        contador++;
        console.log(`✅ Producto ${contador}: "${producto.nombre}" (ID: ${result.insertId})`);
        console.log(`   - Precio: $${producto.precio} COP`);
        console.log(`   - Stock: ${producto.stock} unidades\n`);
      } catch (err) {
        console.error(`❌ Error insertando "${producto.nombre}":`, err.message);
      }
    }

    console.log(`\n✅ Total de productos insertados: ${contador}/7`);

    // Verificar los nuevos productos
    console.log('\n📋 Verificando productos en la BD...');
    const [rows] = await connection.execute('SELECT id, nombre, precio, stock FROM productos ORDER BY id DESC LIMIT 7');
    console.log('\n7 Últimos productos:');
    rows.forEach(p => {
      console.log(`   - [${p.id}] ${p.nombre} - $${p.precio} - Stock: ${p.stock}`);
    });

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

insertarProductos();
