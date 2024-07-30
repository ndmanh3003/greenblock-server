const router = require('express').Router()
const authController = require('../app/controllers/authController')
const verifyToken = require('../middleware/auth')

// body {name, email, password, isBusiness, cert}
router.post('/register', authController.register)

// body {email, password, isBusiness}
router.post('/login', authController.login)

// body {admin}: if admin -> get all accounts, else -> get verified accounts
router.get('/:isBusiness', authController.getAllAccounts)

// body {accountId, code}
router.put('/', authController.verifyAccount)

router.delete('/logout', verifyToken, authController.logout)

// body {refreshToken}
router.post('/refresh', authController.refreshToken)

router.get('/', verifyToken, authController.getDetails)

module.exports = router
