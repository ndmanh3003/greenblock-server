import { Router } from 'express'
const router = Router()

import { authController } from '../app/controllers'
import { verifyToken } from '../middleware'

// body {name, email, password, isBusiness, cert}
router.post('/register', authController.register)

// body {email, password, isBusiness}
router.post('/login', authController.login)

// body {admin_pass}: if admin -> get all accounts, else -> get verified accounts
router.get('/:isBusiness', authController.getAllAccounts)

// body {accountId, isVerified}
router.put('/', authController.verifyAccount)

router.delete('/logout', verifyToken, authController.logout)

// body {refreshToken}
router.post('/refresh', authController.refreshToken)

router.get('/', verifyToken, authController.getDetails)

export default router
