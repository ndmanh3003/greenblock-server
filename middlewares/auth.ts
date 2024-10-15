import { Request } from 'express'
import jwt from 'jsonwebtoken'
import { Auth, IAuth } from '@/models'
import CustomError from './errorHandler'
import { Types } from 'mongoose'

export async function decodeToken(token: string) {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      if (error.name === 'TokenExpiredError') {
        throw new CustomError('Token expired', 401)
      } else {
        throw new CustomError('Invalid token', 401)
      }
    }
    return decoded
  }) as unknown as { _id: string; email: string }
}

export default async function verifyToken(req: Request) {
  const authHeader = req.header('Authorization')
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    throw new CustomError('Token not found', 401)
  }

  const decoded = await decodeToken(token)
  req.userId = new Types.ObjectId(decoded._id)

  const account = await Auth.findById(req.userId)
  if (!account) {
    throw new CustomError('Account not found', 404)
  }
  if (!account?.isVerified) {
    throw new CustomError('Account not verified', 401)
  }
  if (!account.refreshToken) {
    throw new CustomError('Invalid token', 401)
  }
  req.isBusiness = account.isBusiness
}

export const isBusiness = async (req: Request) => {
  await verifyToken(req)
  if (!req.isBusiness) {
    throw new CustomError('Permission denied', 403)
  }
}

export const isInspector = async (req: Request) => {
  await verifyToken(req)
  if (req.isBusiness) {
    throw new CustomError('Permission denied', 403)
  }
}

export async function refreshTokens(account: IAuth) {
  const { _id, email, isVerified } = account

  if (!isVerified) {
    throw new CustomError('Account not verified', 401)
  }

  const accessToken = jwt.sign({ _id, email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '3d'
  })
  const refreshToken = jwt.sign({ _id, email }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d'
  })

  account.refreshToken = refreshToken
  await account.save()

  return { accessToken, refreshToken }
}
