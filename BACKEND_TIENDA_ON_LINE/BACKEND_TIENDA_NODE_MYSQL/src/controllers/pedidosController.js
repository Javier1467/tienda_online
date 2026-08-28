const { getPool } = require("../database/connection")
const { handleError } = require("../utils/errorHandler")

const errorValidacion = (message) => Object.assign(new Error(message), { statusCode: 400 })

// Obtener todos los pedidos o uno por ID
const getPedidos = async (req, res) => {
  try {
    const { id } = req.params
    const pool = getPool()
    const connection = await pool.getConnection()

    if (id) {
      // Obtener pedido con información del cliente
      const [pedidos] = await connection.query(
        `SELECT p.*, c.nombre, c.apellido, c.email 
        FROM pedido p 
        INNER JOIN clientes c ON p.id_cliente = c.id_cliente 
        WHERE p.id = ?`,
        [id],
      )

      if (pedidos.length > 0) {
        const pedido = pedidos[0]

        // Obtener detalles del pedido
        const [detalles] = await connection.query(
          `SELECT dp.*, pr.nombre as producto_nombre, pr.imagen,
            (dp.precio * dp.cantidad) AS subtotal_producto
          FROM detalle_pedido dp 
          INNER JOIN productos pr ON dp.id_producto = pr.id 
          WHERE dp.id_pedido = ?`,
          [id],
        )

        pedido.detalles = detalles
        res.json(pedido)
      } else {
        res.status(404).json({ message: "Pedido no encontrado" })
      }
    } else {
      const [rows] = await connection.query(
        `SELECT p.*, c.nombre, c.apellido, c.email 
        FROM pedido p 
        INNER JOIN clientes c ON p.id_cliente = c.id_cliente 
        ORDER BY p.id DESC`,
      )
      res.json(rows)
    }

    connection.release()
  } catch (error) {
    handleError(res, error, "Error al obtener pedidos")
  }
}

// Crear pedido
const createPedido = async (req, res) => {
  try {
    const { id_cliente, descuento, metodo_pago, aumento, productos } = req.body

    if (!id_cliente || !metodo_pago || !productos || productos.length === 0) {
      return res.status(400).json({ message: "Cliente, método de pago y productos son requeridos" })
    }

    const descuentoPedido = Number(descuento || 0)
    const aumentoPedido = Number(aumento || 0)
    if (!Number.isFinite(descuentoPedido) || descuentoPedido < 0 || !Number.isFinite(aumentoPedido) || aumentoPedido < 0) {
      return res.status(400).json({ message: "El descuento y el costo de envío deben ser valores válidos" })
    }

    const ids = productos.map((producto) => Number(producto.id_producto))
    if (ids.some((id) => !Number.isInteger(id) || id <= 0) || new Set(ids).size !== ids.length) {
      return res.status(400).json({ message: "Los productos deben ser válidos y no estar repetidos" })
    }

    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const [productosBD] = await connection.query(
        "SELECT id, precio, stock FROM productos WHERE id IN (?) FOR UPDATE",
        [ids],
      )
      if (productosBD.length !== productos.length) {
        throw errorValidacion("Uno o más productos no existen")
      }

      let subtotal = 0
      const detalles = productos.map((producto) => {
        const productoBD = productosBD.find((item) => item.id === Number(producto.id_producto))
        const cantidad = Number(producto.cantidad)
        if (!productoBD || !Number.isInteger(cantidad) || cantidad <= 0) {
          throw errorValidacion("Cada producto debe tener una cantidad entera mayor que cero")
        }
        if (productoBD.stock < cantidad) {
          throw errorValidacion(`Stock insuficiente para el producto ${productoBD.id}`)
        }
        subtotal += Number(productoBD.precio) * cantidad
        return { id_producto: productoBD.id, precio: productoBD.precio, cantidad }
      })
      const total = Math.max(0, subtotal + aumentoPedido - descuentoPedido)

      // Crear el pedido con importes calculados por el servidor.
      const [pedidoResult] = await connection.query(
        "INSERT INTO pedido (id_cliente, subtotal, descuento, metodo_pago, aumento, total, estado) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [id_cliente, subtotal, descuentoPedido, metodo_pago, aumentoPedido, total, "Pendiente"],
      )
      const pedidoId = pedidoResult.insertId

      // Agregar productos al detalle del pedido
      for (const producto of detalles) {
        await connection.query(
          "INSERT INTO detalle_pedido (id_pedido, id_producto, precio, cantidad) VALUES (?, ?, ?, ?)",
          [pedidoId, producto.id_producto, producto.precio, producto.cantidad],
        )

        // Actualizar stock
        await connection.query("UPDATE productos SET stock = stock - ? WHERE id = ?", [
          producto.cantidad,
          producto.id_producto,
        ])
      }

      await connection.commit()

      res.status(201).json({
        message: "Pedido creado con éxito",
        id: pedidoId,
        subtotal,
        descuento: descuentoPedido,
        aumento: aumentoPedido,
        total,
        estado: "Pendiente",
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message })
    }
    handleError(res, error, "Error al crear pedido")
  }
}

// Actualizar pedido
const updatePedido = async (req, res) => {
  try {
    const { id } = req.params
    const { id_cliente, descuento, metodo_pago, aumento } = req.body
    const descuentoPedido = Number(descuento || 0)
    const aumentoPedido = Number(aumento || 0)
    if (!id_cliente || !metodo_pago || !Number.isFinite(descuentoPedido) || descuentoPedido < 0 || !Number.isFinite(aumentoPedido) || aumentoPedido < 0) {
      return res.status(400).json({ message: "Los datos del pedido no son válidos" })
    }

    const pool = getPool()
    const connection = await pool.getConnection()
    const [totales] = await connection.query(
      "SELECT COALESCE(SUM(precio * cantidad), 0) AS subtotal FROM detalle_pedido WHERE id_pedido = ?",
      [id],
    )
    const subtotal = Number(totales[0].subtotal)
    const total = Math.max(0, subtotal + aumentoPedido - descuentoPedido)
    const [result] = await connection.query(
      "UPDATE pedido SET id_cliente = ?, subtotal = ?, descuento = ?, metodo_pago = ?, aumento = ?, total = ? WHERE id = ?",
      [id_cliente, subtotal, descuentoPedido, metodo_pago, aumentoPedido, total, id],
    )
    connection.release()

    if (result.affectedRows > 0) {
      res.json({ message: "Pedido actualizado con éxito" })
    } else {
      res.status(404).json({ message: "Pedido no encontrado" })
    }
  } catch (error) {
    handleError(res, error, "Error al actualizar pedido")
  }
}

const updateEstadoPedido = async (req, res) => {
  try {
    const estados = ["Pendiente", "Confirmado", "En preparación", "En camino", "Entregado", "Cancelado"]
    const { estado } = req.body
    if (!estados.includes(estado)) {
      return res.status(400).json({ message: "Estado de pedido no válido" })
    }
    const pool = getPool()
    const connection = await pool.getConnection()
    const [pedido] = await connection.query("SELECT estado FROM pedido WHERE id = ?", [req.params.id])
    if (pedido.length === 0) {
      connection.release()
      return res.status(404).json({ message: "Pedido no encontrado" })
    }
    if (pedido[0].estado === "Entregado" || pedido[0].estado === "Cancelado") {
      connection.release()
      return res.status(409).json({ message: "Este pedido ya no admite cambios de estado" })
    }
    const transiciones = {
      Pendiente: ["Confirmado", "Cancelado"],
      Confirmado: ["En preparación", "Cancelado"],
      "En preparación": ["En camino", "Cancelado"],
      "En camino": ["Entregado", "Cancelado"],
    }
    if (!transiciones[pedido[0].estado]?.includes(estado)) {
      connection.release()
      return res.status(409).json({ message: "La transición de estado no es válida" })
    }
    const [result] = await connection.query("UPDATE pedido SET estado = ? WHERE id = ?", [estado, req.params.id])
    connection.release()
    res.json({ message: "Estado actualizado con éxito", estado })
  } catch (error) {
    handleError(res, error, "Error al actualizar el estado del pedido")
  }
}

// Eliminar pedido
const deletePedido = async (req, res) => {
  try {
    const { id } = req.params

    const pool = getPool()
    const connection = await pool.getConnection()
    const [pedido] = await connection.query("SELECT estado FROM pedido WHERE id = ?", [id])
    if (pedido.length === 0) {
      connection.release()
      return res.status(404).json({ message: "Pedido no encontrado" })
    }
    if (!["Pendiente", "Cancelado"].includes(pedido[0].estado)) {
      connection.release()
      return res.status(409).json({ message: "Solo se pueden eliminar pedidos pendientes o cancelados" })
    }
    const [result] = await connection.query("DELETE FROM pedido WHERE id = ?", [id])
    connection.release()

    if (result.affectedRows > 0) {
      res.json({ message: "Pedido eliminado con éxito" })
    } else {
      res.status(404).json({ message: "Pedido no encontrado" })
    }
  } catch (error) {
    handleError(res, error, "Error al eliminar pedido")
  }
}

module.exports = {
  getPedidos,
  createPedido,
  updatePedido,
  updateEstadoPedido,
  deletePedido,
}
