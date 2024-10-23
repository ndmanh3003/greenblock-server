import { Request } from 'express'
import bcrypt from 'bcryptjs'
import { Auth } from '@/models'
import { decodeToken, refreshTokens } from '@/middlewares/auth'
import CustomError from '@/middlewares/errorHandler'

const rawAuthController = {
  register: async (req: Request) => {
    const { name, email, password, isBusiness, cert } = req.body

    const isExisting = await Auth.findOneWithDeleted({ email })
    if (isExisting) {
      throw new CustomError('Email already exists', 400)
    }

    const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS))
    const newAuth = new Auth({ name, email, password: hashedPassword, isBusiness, cert })
    await newAuth.save()
  },

  login: async (req: Request) => {
    const { email, password, isBusiness } = req.body

    const auth = await Auth.findOne({ email, isBusiness })
    if (!auth) {
      throw new CustomError('Email not found', 400)
    }
    if (!auth.isVerified) {
      throw new CustomError('Account not verified', 400)
    }

    const isPasswordValid = await bcrypt.compare(password, auth.password)
    if (!isPasswordValid) {
      throw new CustomError('Incorrect password', 400)
    }

    const tokens = await refreshTokens(auth)
    return tokens
  },

  getAllAccounts: async (req: Request) => {
    const { type, code } = req.query
    const isBusiness = type === 'business'
    let query = {}

    if (code) {
      if (code === process.env.ADMIN_PASSWORD) {
        query = { isVerified: false }
      } else {
        throw new CustomError('Invalid admin password', 400)
      }
    } else {
      query = { isVerified: true }
    }

    const accounts = await Auth.find({ ...query, isBusiness }).select('name email cert isBusiness')
    return accounts
  },

  verifyAccount: async (req: Request) => {
    const { accountId, isVerified } = req.body

    if (isVerified) {
      const account = await Auth.findOneAndUpdate({ _id: accountId, isVerified: false }, { isVerified })
      if (!account) {
        throw new CustomError('Account not found or already verified', 400)
      }
    } else {
      const account = await Auth.deleteById(accountId)
      if (!account) {
        throw new CustomError('Account not found', 400)
      }
    }
  },

  logout: async (req: Request) => {
    const account = await Auth.findByIdAndUpdate(req.userId, { refreshToken: null })
    if (!account) {
      throw new CustomError('Account not found', 400)
    }
  },

  refreshToken: async (req: Request) => {
    const { refreshToken } = req.params

    const decoded = await decodeToken(refreshToken)

    const account = await Auth.findById(decoded._id)
    if (!account) {
      throw new CustomError('Invalid refresh token', 400)
    }

    const tokens = await refreshTokens(account)
    return tokens
  },

  getDetail: async (req: Request) => {
    const account = await Auth.findById(req.userId).select('name email cert isBusiness')
    if (!account) {
      throw new CustomError('Account not found', 400)
    }

    return account
  }
}

export default rawAuthController
