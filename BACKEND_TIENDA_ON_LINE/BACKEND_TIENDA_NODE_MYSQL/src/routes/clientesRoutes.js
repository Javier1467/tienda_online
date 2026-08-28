const express = require("express")
const { getClientes, createCliente, updateCliente, deleteCliente } = require("../controllers/clientesController")
const { verificarAdmin, verificarVendedorOAdmin } = require("../middleware/auth")

const router = express.Router()

// GET /api/clientes
// GET /api/clientes/:id
router.get("/:id?", getClientes)

// POST /api/clientes - Requiere vendedor o admin
router.post("/", verificarVendedorOAdmin, createCliente)

// PUT /api/clientes/:id - Requiere vendedor o admin
router.put("/:id", verificarVendedorOAdmin, updateCliente)

// DELETE /api/clientes/:id - Solo admin
router.delete("/:id", verificarAdmin, deleteCliente)

module.exports = router
