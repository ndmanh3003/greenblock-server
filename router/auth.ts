import { Router } from 'express'
const router = Router()

import { authController } from '../app/controllers'
import { verifyToken } from '../middleware'
import { validateSchema } from '../middleware'
import * as schema from './auth.schema'

router.post('/register', validateSchema(schema.registerSchema), authController.register)

router.post('/login', validateSchema(schema.loginSchema), authController.login)

router.get('/:isBusiness', validateSchema(schema.getAllAccountsSchema), authController.getAllAccounts)

router.put('/', validateSchema(schema.verifyAccountSchema), authController.verifyAccount)

router.delete('/logout', verifyToken, authController.logout)

router.post('/refresh', validateSchema(schema.refreshTokenSchema), authController.refreshToken)

router.get('/', verifyToken, authController.getDetails)

export default router
