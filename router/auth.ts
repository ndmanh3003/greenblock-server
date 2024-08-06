import { Router } from 'express'
const router = Router()

import { authController } from '../app/controllers'
import { verifyToken } from '../middleware'
import { validateSchema } from '../middleware'
import * as schema from './auth.schema'

// body {name, email, password, isBusiness, cert}
router.post('/register', validateSchema(schema.registerSchema), authController.register)

// body {email, password, isBusiness}
router.post('/login', validateSchema(schema.loginSchema), authController.login)

// body {admin_pass}: if admin -> get all accounts, else -> get verified accounts
router.get('/:isBusiness', validateSchema(schema.getAllAccountsSchema), authController.getAllAccounts)

// body {accountId, isVerified}
router.put('/', validateSchema(schema.verifyAccountSchema), authController.verifyAccount)

router.delete('/logout', verifyToken, authController.logout)

// body {refreshToken}
router.post('/refresh', validateSchema(schema.refreshTokenSchema), authController.refreshToken)

router.get('/', verifyToken, authController.getDetails)

export default router
