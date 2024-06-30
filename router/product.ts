const router = require('express').Router()
const productController = require('../app/controllers/productController')

// Get all products with each role
router.get('/', productController.getProducts)

module.exports = router
