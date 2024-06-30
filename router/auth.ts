const router = require('express').Router()
const authController = require('../app/controllers/authController')
const verifyToken = require('../middleware/auth')

// Register
router.post('/register', authController.register)
// Login with email, password and role
router.post('/login', authController.login)
// Verify account
router.put('/', authController.verifyAccount)
// Get all deleted accounts
router.get('/deleted', authController.getDeleted)
// Logout
router.delete('/logout', verifyToken, authController.logout)
// Refresh token
router.post('/refresh', authController.refreshToken)
// Get all accounts by role
router.get('/:isBusiness', authController.getAccounts)

module.exports = router
