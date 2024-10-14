import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Auth, IAuth } from '@/models'
import CustomErr from './errorHandler'

export async function decodeToken(token: string) {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        throw new CustomErr('Token expired', 401)
      } else {
        throw new CustomErr('Invalid token', 401)
      }
    }
    return decoded
  }) as unknown as { _id: string; email: string }
}

export default async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('Authorization')
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    throw new CustomErr('Token not found', 401)
  }

  const decoded = await decodeToken(token)
  req.userId = decoded._id

  const account = await Auth.findById(req.userId)
  if (!account) {
    throw new CustomErr('Account not found', 404)
  }
  if (!account?.isVerified) {
    throw new CustomErr('Account not verified', 401)
  }
  if (!account.refreshToken) {
    throw new CustomErr('Invalid token', 401)
  }
  req.isBusiness = account.isBusiness

  next()
}

export const isBusiness = async (req: Request, res: Response, next: NextFunction) => {
  await verifyToken(req, res, next)
  if (!req.isBusiness) {
    throw new CustomErr('Permission denied', 403)
  }
  next()
}

export const isInspector = async (req: Request, res: Response, next: NextFunction) => {
  await verifyToken(req, res, next)
  if (req.isBusiness) {
    throw new CustomErr('Permission denied', 403)
  }
  next()
}

export async function refreshTokens(account: IAuth) {
  const { _id, email, isVerified } = account

  if (!isVerified) {
    throw new CustomErr('Account not verified', 401)
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
