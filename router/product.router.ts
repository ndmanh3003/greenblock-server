import { Router } from 'express'
const router = Router()

import { productController } from '../app/controllers'
import { isBusiness, validateSchema, verifyToken } from '../middleware'
import * as schema from './product.schema'

router.post('/', isBusiness, validateSchema(schema.createProductSchema), productController.createProduct)

router.put('/record/:isDelete', validateSchema(schema.handleStatusSchema), productController.handleStatus)

router.put('/', verifyToken, validateSchema(schema.updateProductSchema), productController.updateProduct)

router.delete('/:productId', isBusiness, validateSchema(schema.deleteProductSchema), productController.deleteProduct)

router.get('/', validateSchema(schema.getAllProductsSchema), productController.getAllProducts)

router.get('/:productId', validateSchema(schema.getProductDetailsSchema), productController.getProductDetails)

export default router
