const router = require('express').Router()
const authController = require('../app/controllers/authController')
const verifyToken = require('../middleware/auth')

/**
 * @desc    Register a new user account
 * @access  Public
 * @body    { name: string, email: string, password: string, isBusiness: boolean }
 * @returns { message: string }
 */
router.post('/register', authController.register)

/**
 * @desc    Authenticate user and get tokens
 * @access  Public
 * @body    { email: string, password: string, isBusiness: boolean }
 * @returns { name: string, isBusiness: boolean, accessToken: string, refreshToken: string }
 */
router.post('/login', authController.login)

/**
 * @desc    Verify or delete an unverified account
 * @access  Private (typically admin only)
 * @body    { id: string, password: string, isVerified: boolean }
 * @returns { message: string }
 */
router.put('/', authController.verifyAccount)

/**
 * @desc    Logout user and invalidate refresh token
 * @access  Private
 * @returns { message: string }
 */
router.delete('/logout', verifyToken, authController.logout)

/**
 * @desc    Get new access token using refresh token
 * @access  Public
 * @body    { refreshToken: string }
 * @returns { accessToken: string, refreshToken: string }
 */
router.post('/refresh', authController.refreshToken)

/**
 * @desc    Get all accounts by business status
 * @access  Private
 * @param   isBusiness - boolean as string ('true' or 'false')
 * @body    { admin?: string } - Optional admin password for unverified accounts
 * @returns Array of account objects
 */
router.get('/:isBusiness', authController.getAccounts)

module.exports = router
