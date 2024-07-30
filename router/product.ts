const router = require('express').Router()
const productController = require('../app/controllers/productController')
const { isBusiness } = require('../middleware/role')
const verifyToken = require('../middleware/auth')

// body { name, variety, land, inspector, quanity }
router.post('/', isBusiness, productController.createProduct)

// body { EXCEPT: record, export_at, land, variety }
router.put('/:id', verifyToken, productController.updateProduct)

router.delete('/:id', isBusiness, productController.deleteProduct)

// body { code, businessId } -> If business/inspector, work with header token
router.get('/', verifyToken, productController.getAllProducts)

router.get('/:id', productController.getProductDetails)

// body { productId, img, desc, isHarvested }
router.put('/:isDelete', productController.handleStatus)

module.exports = router
