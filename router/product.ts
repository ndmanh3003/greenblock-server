import { Router } from 'express'
const router = Router()

import { productController } from '../app/controllers'
import { isBusiness, verifyToken } from '../middleware'

// body { name, variety, land, inspector, quantityIn }
router.post('/', isBusiness, productController.createProduct)

// body { productId, img, desc, isHarvested, code, businessId }
router.put('/record/:isDelete', productController.handleStatus)

// body { EXCEPT: record, exportAt, land, variety, quantityIn }
router.put('/', verifyToken, productController.updateProduct)

router.delete('/:id', isBusiness, productController.deleteProduct)

// body { code, businessId } -> If business/inspector, work with header token
router.get('/', productController.getAllProducts)

router.get('/:productId', productController.getProductDetails)

export default router
