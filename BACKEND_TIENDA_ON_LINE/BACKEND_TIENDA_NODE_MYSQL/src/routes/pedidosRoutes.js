const express = require("express")
const { getPedidos, createPedido, updatePedido, updateEstadoPedido, deletePedido } = require("../controllers/pedidosController")
const { verificarAdmin, verificarVendedorOAdmin } = require("../middleware/auth")

const router = express.Router()

// GET /api/pedidos
// GET /api/pedidos/:id
router.get("/:id?", getPedidos)

// POST /api/pedidos
router.post("/", verificarVendedorOAdmin, createPedido)

// PUT /api/pedidos/:id
router.put("/:id", verificarVendedorOAdmin, updatePedido)
router.patch("/:id/estado", verificarVendedorOAdmin, updateEstadoPedido)

// DELETE /api/pedidos/:id
router.delete("/:id", verificarAdmin, deletePedido)

module.exports = router
