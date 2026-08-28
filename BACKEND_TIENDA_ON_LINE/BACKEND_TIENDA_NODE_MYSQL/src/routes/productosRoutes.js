const express = require("express")
const { getProductos, createProducto, updateProducto, deleteProducto } = require("../controllers/productosController")
const { verificarAdmin, verificarVendedorOAdmin } = require("../middleware/auth")

const router = express.Router()

// GET /api/productos
// GET /api/productos/:id
router.get("/:id?", getProductos)

// POST /api/productos - Requiere vendedor o admin
router.post("/", verificarVendedorOAdmin, createProducto)

// PUT /api/productos/:id - Requiere vendedor o admin
router.put("/:id", verificarVendedorOAdmin, updateProducto)

// DELETE /api/productos/:id - Solo admin
router.delete("/:id", verificarAdmin, deleteProducto)

module.exports = router
