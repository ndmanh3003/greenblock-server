const { Request, Response } = require('express')
const { IAuth } = require('./../models/Auth')
const { Auth } = require('../models')

const authController = {
  // Register
  register: async (req: typeof Request, res: typeof Response) => {
    try {
      const newAuth = new Auth(req.body)
      await newAuth.save()

      res.status(201).json('OK')
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

      res.status(200).json(auth.email)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  },
  // Get all accounts by role
  getAccounts: async (req: typeof Request, res: typeof Response) => {
    try {
      const accounts = await Auth.find({ isBusiness: req.params.isBusiness })
      //Hide all passwords
      accounts.map((account: typeof IAuth) => {
        account.password = undefined
        return account
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
      const account = await Auth.findById(req.body.id)
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
  }
}

module.exports = authController
