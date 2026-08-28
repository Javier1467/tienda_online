// Script para insertar 20 clientes de prueba en la base de datos tienda_online
// Ejecución: node scripts/insert-test-clientes.js

require("dotenv").config()
const mysql = require("mysql2/promise")

const testClientes = [
  {
    nombre: "Andrés",
    apellido: "Martínez López",
    email: "andres.martinez@gmail.com",
    celular: "3001234567",
    direccion: "Calle 45 # 20-15",
    direccion2: "Apartamento 302",
    descripcion: "Dejar en portería",
  },
  {
    nombre: "Laura",
    apellido: "Gómez Ramírez",
    email: "laura.gomez@gmail.com",
    celular: "3012345678",
    direccion: "Carrera 52 # 10-25",
    direccion2: "Casa 5",
    descripcion: "Tocar timbre 2 veces",
  },
  {
    nombre: "Carlos",
    apellido: "Pérez Torres",
    email: "carlos.perez@gmail.com",
    celular: "3023456789",
    direccion: "Calle 30 # 45-18",
    direccion2: null,
    descripcion: null,
  },
  {
    nombre: "Natalia",
    apellido: "Rodríguez Mejía",
    email: "natalia.rodriguez@gmail.com",
    celular: "3034567890",
    direccion: "Carrera 15 # 60-30",
    direccion2: "Torre 2 Piso 8",
    descripcion: "Entregar a recepción",
  },
  {
    nombre: "Juan David",
    apellido: "Hernández García",
    email: "juandavid.hernandez@gmail.com",
    celular: "3045678901",
    direccion: "Calle 72 # 35-22",
    direccion2: null,
    descripcion: null,
  },
  {
    nombre: "Mariana",
    apellido: "Castro Gómez",
    email: "mariana.castro@gmail.com",
    celular: "3056789012",
    direccion: "Carrera 80 # 50-15",
    direccion2: "Oficina 402",
    descripcion: "Horario: Lunes a Viernes 8-5",
  },
  {
    nombre: "Felipe",
    apellido: "Restrepo Díaz",
    email: "felipe.restrepo@gmail.com",
    celular: "3067890123",
    direccion: "Calle 9 # 25-10",
    direccion2: "Apartamento 1201",
    descripcion: null,
  },
  {
    nombre: "Valentina",
    apellido: "Sánchez Ríos",
    email: "valentina.sanchez@gmail.com",
    celular: "3078901234",
    direccion: "Carrera 100 # 15-30",
    direccion2: null,
    descripcion: "Cliente VIP",
  },
  {
    nombre: "Sebastián",
    apellido: "Vargas López",
    email: "sebastian.vargas@gmail.com",
    celular: "3089012345",
    direccion: "Calle 67 # 85-45",
    direccion2: "Casa verde",
    descripcion: null,
  },
  {
    nombre: "Camila",
    apellido: "Moreno García",
    email: "camila.moreno@gmail.com",
    celular: "3090123456",
    direccion: "Carrera 25 # 42-18",
    direccion2: null,
    descripcion: "Envíos sin observación",
  },
  {
    nombre: "Daniel",
    apellido: "Ramírez Torres",
    email: "daniel.ramirez@gmail.com",
    celular: "3001234561",
    direccion: "Calle 55 # 75-32",
    direccion2: "Apartamento 505",
    descripcion: null,
  },
  {
    nombre: "Sofía",
    apellido: "González Pérez",
    email: "sofia.gonzalez@gmail.com",
    celular: "3012345679",
    direccion: "Carrera 38 # 28-14",
    direccion2: null,
    descripcion: "Entregar en horario laboral",
  },
  {
    nombre: "Miguel Ángel",
    apellido: "Cardona Ruiz",
    email: "miguelangel.cardona@gmail.com",
    celular: "3023456780",
    direccion: "Calle 120 # 60-50",
    direccion2: "Apartamento 3A",
    descripcion: null,
  },
  {
    nombre: "Carolina",
    apellido: "Jiménez Ruiz",
    email: "carolina.jimenez@gmail.com",
    celular: "3034567891",
    direccion: "Carrera 70 # 12-25",
    direccion2: null,
    descripcion: "Aviso previo importante",
  },
  {
    nombre: "Santiago",
    apellido: "Herrera Gómez",
    email: "santiago.herrera@gmail.com",
    celular: "3045678902",
    direccion: "Calle 5 # 95-60",
    direccion2: "Casa blanca",
    descripcion: null,
  },
  {
    nombre: "Daniela",
    apellido: "Castaño López",
    email: "daniela.castano@gmail.com",
    celular: "3056789013",
    direccion: "Carrera 45 # 38-22",
    direccion2: "Oficina 201",
    descripcion: "Teléfono de contacto: Extensión 105",
  },
  {
    nombre: "Alejandro",
    apellido: "Ríos Martínez",
    email: "alejandro.rios@gmail.com",
    celular: "3067890124",
    direccion: "Calle 88 # 15-40",
    direccion2: null,
    descripcion: null,
  },
  {
    nombre: "Paula Andrea",
    apellido: "Molina Soto",
    email: "paula.molina@gmail.com",
    celular: "3078901235",
    direccion: "Carrera 90 # 48-18",
    direccion2: "Apartamento 704",
    descripcion: "Entregar entre 2-6 PM",
  },
  {
    nombre: "Nicolás",
    apellido: "Vélez Restrepo",
    email: "nicolas.velez@gmail.com",
    celular: "3089012346",
    direccion: "Calle 18 # 65-30",
    direccion2: null,
    descripcion: null,
  },
  {
    nombre: "Juliana",
    apellido: "Ospina García",
    email: "juliana.ospina@gmail.com",
    celular: "3090123457",
    direccion: "Carrera 110 # 22-50",
    direccion2: "Casa 12",
    descripcion: "Cliente frecuente",
  },
]

const insertarClientes = async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "tienda_online",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })

  const connection = await pool.getConnection()

  try {
    console.log("🔄 Iniciando inserción de 20 clientes de prueba...")
    let exitosos = 0
    let errores = 0

    for (const cliente of testClientes) {
      try {
        await connection.query(
          "INSERT INTO clientes (nombre, apellido, email, celular, direccion, direccion2, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [cliente.nombre, cliente.apellido, cliente.email, cliente.celular, cliente.direccion, cliente.direccion2 || "", cliente.descripcion || ""],
        )
        console.log(`✅ Insertado: ${cliente.nombre} ${cliente.apellido}`)
        exitosos++
      } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
          console.log(`⚠️  Saltado: ${cliente.email} (ya existe)`)
        } else {
          console.error(`❌ Error al insertar ${cliente.nombre}: ${error.message}`)
        }
        errores++
      }
    }

    console.log(`\n✨ Resumen: ${exitosos} clientes insertados, ${errores} errores/duplicados`)

    // Obtener total de clientes
    const [rows] = await connection.query("SELECT COUNT(*) as total FROM clientes")
    console.log(`📊 Total de clientes en base de datos: ${rows[0].total}`)
  } catch (error) {
    console.error("❌ Error grave:", error.message)
  } finally {
    connection.release()
    await pool.end()
  }
}

insertarClientes()
