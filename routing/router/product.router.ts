import { Router } from 'express'
const router = Router()

import * as schema from '@/routing/schemas/product.schema'
import validateSchema from '@/middlewares/joi'
import verifyToken, { isBusiness } from '@/middlewares/auth'
import { productController } from '@/controllers'

router.post('/', isBusiness, validateSchema(schema.createProductSchema), productController.createProduct)

router.delete('/:productId', isBusiness, validateSchema(schema.deleteProductSchema), productController.deleteProduct)

router.put('/', verifyToken, validateSchema(schema.updateProductSchema), productController.updateProduct)

router.get('/all', validateSchema(schema.getAllProductsSchema), productController.getAllProducts)

router.get('/statistics', isBusiness, productController.getProductStatistics)

router.get('/:productId', validateSchema(schema.getProductDetailSchema), productController.getProductDetail)

router.put('/record', validateSchema(schema.handleRecordSchema), productController.handleRecord)

export default router
