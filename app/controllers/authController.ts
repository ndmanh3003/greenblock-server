const { refreshTokens } = require('../../utils/refreshTokens')
const { Request, Response } = require('express')
const { Auth, Batch } = require('../models')
const { IAuth } = require('../models/Auth')
require('dotenv').config()

const authController = {
  register: async (req: typeof Request, res: typeof Response) => {
    try {
      const newAuth = new Auth(req.body)
      await newAuth.save()

      return res.status(201).json({ message: 'Registration successful' })
    } catch (error) {
      return res.status(400).json({ message: 'Registration failed', error: error.message })
    }
  },

  login: async (req: typeof Request, res: typeof Response) => {
    try {
      const { email, password, isBusiness } = req.body
      const auth = await Auth.findOne({ email, password, isBusiness })

      if (!auth) return res.status(400).json({ message: 'Invalid credentials' })
      if (!auth.code) return res.status(401).json({ message: 'Account not verified' })

      const tokens = await refreshTokens(auth)

      return res.status(200).json({
        message: 'Login successful',
        data: { name: auth.name, isBusiness: auth.isBusiness, ...tokens }
      })
    } catch (error) {
      return res.status(500).json({ message: 'Login failed', error: error.message })
    }
  },

  getAllAccounts: async (req: typeof Request, res: typeof Response) => {
    try {
      const { isBusiness } = req.params
      const { admin } = req.body

      let accounts = (await Auth.find({ isBusiness })) as (typeof IAuth)[]

      if (admin == process.env.ADMIN_PASSWORD) accounts = accounts.filter((account) => !account.code)
      else if (admin) return res.status(401).json({ message: 'Invalid admin password' })
      else accounts = accounts.filter((account) => account.code)

      accounts = accounts.map(({ _id, name, email, isBusiness, cert }) => ({
        _id,
        name,
        email,
        isBusiness,
        cert
      }))

      return res.status(200).json({ message: 'Accounts retrieved successfully', data: accounts })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve accounts', error: error.message })
    }
  },

  verifyAccount: async (req: typeof Request, res: typeof Response) => {
    try {
      const { accountId, code } = req.body
      const account = await Auth.findOne({ _id: accountId, code: null })

      if (!account) return res.status(404).json({ message: 'Account not found or already verified' })

      if (code) {
        account.code = code
        await account.save()
        await refreshTokens(account)

        // create batch
        const newBatch = new Batch({ business: accountId })
        await newBatch.save()

        return res.status(200).json({ message: 'Account verified successfully' })
      } else {
        await account.delete()
        return res.status(200).json({ message: 'Account deleted successfully' })
      }
    } catch (error) {
      return res.status(500).json({ message: 'Failed to verify account', error: error.message })
    }
  },

  logout: async (req: typeof Request, res: typeof Response) => {
    try {
      const account = await Auth.findByIdAndUpdate(req.userId, { refreshToken: null })
      if (!account) return res.status(400).json({ message: 'Account not found' })

      return res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to logout', error: error.message })
    }
  },

  refreshToken: async (req: typeof Request, res: typeof Response) => {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' })

      const account = await Auth.findOne({ refreshToken })
      if (!account) return res.status(403).json({ message: 'Invalid refresh token' })
      const tokens = await refreshTokens(account)

      return res.status(200).json({ message: 'Token refreshed successfully', data: tokens })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to refresh token', error: error.message })
    }
  },

  getDetails: async (req: typeof Request, res: typeof Response) => {
    try {
      const account = await Auth.findById(req.userId)
      if (!account) return res.status(404).json({ message: 'Account not found' })

      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const { password, refreshToken, ...data } = account.toObject()

      return res.status(200).json({ message: 'Account details retrieved successfully', data })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve account details', error: error.message })
    }
  }
}

module.exports = authController
