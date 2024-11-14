import { Router } from 'express'
const router = Router()

import validateSchema from '@/middlewares/joi'
import * as schema from '@/routing/schemas/auth.schema'
import { authController } from '@/controllers'
import verifyToken from '@/middlewares/auth'

router.post('/register', validateSchema(schema.registerSchema), authController.register)

router.post('/login', validateSchema(schema.loginSchema), authController.login)

router.get('/all', validateSchema(schema.getAllAccountsSchema), authController.getAllAccounts)

router.put('/verify', validateSchema(schema.verifyAccountSchema), authController.verifyAccount)

router.delete('/logout', verifyToken, authController.logout)

router.post('/refresh/:refreshToken', validateSchema(schema.refreshTokenSchema), authController.refreshToken)

router.get('/getme', verifyToken, authController.getme)

export default router
