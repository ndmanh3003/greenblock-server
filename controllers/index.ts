import rawAuthController from '@/controllers/auth.controller'
import wrapControllerWithTransaction from '@/utils/transaction'

export const authController = wrapControllerWithTransaction(rawAuthController)
