import { Request, Response } from 'express'
import { refreshTokens } from '../../utils/token'
import { Auth } from '../models'
import bcrypt from 'bcryptjs'

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const { name, email, password, isBusiness, cert } = req.body
      const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS))

      const isExisting = await Auth.findOneWithDeleted({ email })
      if (isExisting) return res.status(400).json({ message: 'Email already exists' })

      const newAuth = new Auth({ name, email, password: hashedPassword, isBusiness, cert })
      await newAuth.save()

      return res.status(201).json({ message: 'Registration successful' })
    } catch (error) {
      return res.status(400).json({ message: 'Registration failed', error: error.message })
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password, isBusiness } = req.body

      const auth = await Auth.findOne({ email, isBusiness })
      if (!auth) return res.status(400).json({ message: 'Invalid credentials' })
      if (!auth.isVerified) return res.status(401).json({ message: 'Account not verified' })

      const isPasswordValid = await bcrypt.compare(password, auth.password)
      if (!isPasswordValid) return res.status(400).json({ message: 'Invalid credentials' })

      const tokens = await refreshTokens(auth)

      return res.status(200).json({
        message: 'Login successful',
        data: { name: auth.name, ...tokens }
      })
    } catch (error) {
      return res.status(500).json({ message: 'Login failed', error: error.message })
    }
  },

  getAllAccounts: async (req: Request, res: Response) => {
    try {
      const isBusiness = req.params.type === 'business'
      const { admin_pass } = req.body
      let query = {}

      if (admin_pass === process.env.ADMIN_PASSWORD) query = { isVerified: false }
      else if (admin_pass) return res.status(401).json({ message: 'Invalid admin password' })
      else query = { isVerified: true }

      const accounts = (await Auth.find({ ...query, isBusiness })).map((account) => {
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        const { password, refreshToken, ...data } = account.toObject()
        return data
      })

      return res.status(200).json({ message: 'Accounts retrieved successfully', data: accounts })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve accounts', error: error.message })
    }
  },

  verifyAccount: async (req: Request, res: Response) => {
    try {
      const { accountId, isVerified } = req.body

      if (isVerified) {
        const account = await Auth.findOneAndUpdate({ _id: accountId, isVerified: false }, { isVerified })
        if (!account) return res.status(404).json({ message: 'Account not found or already verified' })

        return res.status(200).json({ message: 'Account verified successfully' })
      } else {
        const account = await Auth.deleteById(accountId)
        if (!account) return res.status(404).json({ message: 'Account not found' })

        return res.status(200).json({ message: 'Account deleted successfully' })
      }
    } catch (error) {
      return res.status(500).json({ message: 'Failed to verify account', error: error.message })
    }
  },

  logout: async (req: Request, res: Response) => {
    try {
      const account = await Auth.findByIdAndUpdate(req.userId, { refreshToken: null })
      if (!account) return res.status(400).json({ message: 'Account not found' })

      return res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to logout', error: error.message })
    }
  },

  refreshToken: async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body

      const account = await Auth.findOne({ refreshToken })
      if (!account) return res.status(403).json({ message: 'Invalid refresh token' })

      const tokens = await refreshTokens(account)

      return res.status(200).json({ message: 'Token refreshed successfully', data: tokens })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to refresh token', error: error.message })
    }
  },

  getDetails: async (req: Request, res: Response) => {
    try {
      const account = await Auth.findById(req.userId)
      if (!account) return res.status(404).json({ message: 'Account not found' })

      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      const { password, refreshToken, ...data } = account.toObject()

      return res.status(200).json({ message: 'Account details retrieved successfully', data })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve account details', error: error.message })
    }
  }
}
