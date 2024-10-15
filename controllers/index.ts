import wrapControllerWithTransaction from '@/utils/transaction'
import rawAuthController from '@/controllers/auth.controller'

export const authController = wrapControllerWithTransaction(rawAuthController)
