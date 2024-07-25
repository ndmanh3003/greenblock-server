const router = require('express').Router()
const productController = require('../app/controllers/productController')
const { isBusiness } = require('../middleware/role')
const verifyToken = require('../middleware/auth')

/**
 * @desc    Get all products
 * @access  Private (business, inspector, employee)
 * @header  Authorization - Optional. If provided, verifies token
 * @body    { businessId?: string, isFarmer?: boolean, phone?: string }
 * @returns Array of product details
 */
router.get('/', productController.getProducts)

/**
 * @desc    Get product by id
 * @access  Public (intended for consumers)
 * @param   id - Product ID
 * @returns Product detail object
 */
router.get('/:id', productController.getProductById)

/**
 * @desc    Create a new product
 * @access  Private (business only)
 * @body    { name: string, variety: string, location: string, inspectorId: string, desc: string }
 * @returns Created product ID
 */
router.post('/', isBusiness, productController.createProduct)

/**
 * @desc    Update product details
 * @access  Private (business, inspector)
 * @body    { id: string, name?: string, variety?: string, location?: string, desc?: string, imgCert?: string }
 * @returns Success message
 */
router.put('/', verifyToken, productController.updateProduct)

/**
 * @desc    Handle product status changes
 * @access  Private (employees)
 * @body    { productId: string, businessId: string, isFarmer: boolean, phone: string, type: number, desc?: string, img?: string[] }
 * @returns Success message
 */
router.put('/status', productController.handleStatus)

module.exports = router
