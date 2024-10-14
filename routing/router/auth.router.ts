import { Router } from 'express'
const router = Router()

import verifyToken from '@/middlewares/auth'
import validateSchema from '@/middlewares/joi'
import * as schema from '@/routing/schemas/auth.schema'
import { authController } from '@/controllers'

router.post('/register', validateSchema(schema.registerSchema), authController.register)

router.post('/login', validateSchema(schema.loginSchema), authController.login)

router.get('/getAll', validateSchema(schema.getAllAccountsSchema), authController.getAllAccounts)

router.put('/verify', validateSchema(schema.verifyAccountSchema), authController.verifyAccount)

router.delete('/logout', verifyToken, authController.logout)

router.post('/refresh/:refreshToken', validateSchema(schema.refreshTokenSchema), authController.refreshToken)

router.get('/detail', verifyToken, authController.getDetail)

export default router
