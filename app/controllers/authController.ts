const { refreshTokens } = require('../../utils/refreshTokens')
const { Request, Response } = require('express')
const { IAuth } = require('./../models/Auth')
const { Auth } = require('../models')
require('dotenv').config()

const authController = {
  // Register
  register: async (req: typeof Request, res: typeof Response) => {
    try {
      const newAuth = new Auth(req.body)
      const savedAuth = await newAuth.save()

      const tokens = await refreshTokens(savedAuth)

      res.status(201).json({ tokens })
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  },
  // Login with email, password and role
  login: async (req: typeof Request, res: typeof Response) => {
    try {
      const auth = await Auth.findOne({
        email: req.body.email,
        password: req.body.password,
        isBusiness: req.body.isBusiness
      })
      if (!auth) return res.status(400).json('Invalid credentials')

      const tokens = await refreshTokens(auth)

      res.status(200).json(tokens)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  },
  // Get all accounts by role
  getAccounts: async (req: typeof Request, res: typeof Response) => {
    try {
      let accounts = await Auth.find({ isBusiness: req.params.isBusiness })

      if (req.body.admin == process.env.ADMIN_PASSWORD) return res.status(200).json(accounts)
      else if (req.body.admin) return res.status(401).json('Unauthorized')

      // Filter only verified accounts
      accounts = accounts
        .filter((account: typeof IAuth) => account.isVerified)
        .map((account: typeof IAuth) => {
          return {
            _id: account._id,
            email: account.email,
            isBusiness: account.isBusiness,
            isVerified: account.isVerified,
            cert: account.cert
          }
        })

      res.status(200).json(accounts)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  },
  // Verify account
  verifyAccount: async (req: typeof Request, res: typeof Response) => {
    try {
      // 1 is verified, 0 is deleted
      const account = await Auth.findOne({ _id: req.body.id, refreshToken: req.body.refreshToken })
      if (!account) return res.status(400).json('Account not found')
      else if (!req.body.isVerified) {
        await account.delete()
      } else {
        account.isVerified = true
        await account.save()
      }

      res.status(200).json('OK')
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  },
  // Get deleted accounts
  getDeleted: async (req: typeof Request, res: typeof Response) => {
    try {
      const accounts = await Auth.findDeleted()

      res.status(200).json(accounts)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  },
  // Logout
  logout: async (req: typeof Request, res: typeof Response) => {
    try {
      console.log(req.userId)
      const account = await Auth.findByIdAndUpdate(req.userId, { refreshToken: null })

      if (!account) return res.status(400).json('Account not found')

      res.sendStatus(204)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  },
  // Refresh token
  refreshToken: async (req: typeof Request, res: typeof Response) => {
    try {
      const refreshToken = req.body.refreshToken
      if (!refreshToken) return res.status(401).json('User not authenticated')

      const account = await Auth.findOne({ refreshToken })
      if (!account) return res.status(403).json('Invalid token')

      const tokens = await refreshTokens(account)

      res.status(200).json(tokens)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }
}

module.exports = authController
