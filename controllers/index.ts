import wrapControllerWithTransaction from '@/utils/transaction'
import rawAuthController from '@/controllers/auth.controller'
import rawBatchController from '@/controllers/batch.controller'
import rawProductController from '@/controllers/product.controller'

export const authController = wrapControllerWithTransaction(rawAuthController)
export const batchController = wrapControllerWithTransaction(rawBatchController)
export const productController = wrapControllerWithTransaction(rawProductController)
