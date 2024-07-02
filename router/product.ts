const router = require('express').Router()
const productController = require('../app/controllers/productController')
const { isBusiness } = require('../middleware/role')
const verifyToken = require('../middleware/auth')

// Get all products with roles: business, inspector, farmer, processor
router.get('/', productController.getProducts)
// Get product by id with roles: consumer
router.get('/:id', productController.getProductById)
// Create a new product with role: business
router.post('/', isBusiness, productController.createProduct)
// Update product with roles: business, inspector
router.put('/', verifyToken, productController.updateProduct)
// Handle stauts with 4 types: 0: history, 1: harvest, 2: export, 3: delete
router.put('/status', productController.handleStatus)

module.exports = router
