const router = require('express').Router()
const authController = require('../app/controllers/authController')

// Register
router.post('/register', authController.register)
// Login with email, password and role
router.post('/login', authController.login)
// Verify account
router.put('/', authController.verifyAccount)
// Get all deleted accounts
router.get('/deleted', authController.getDeleted)
// Logout
// router.post('/logout', authController.logout)
// Get all accounts by role
router.get('/:isBusiness', authController.getAccounts)

module.exports = router
