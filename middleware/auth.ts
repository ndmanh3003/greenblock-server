import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Auth } from '../app/models'

export const verifyToken = async (req: Request, res: Response, next?: NextFunction) => {
  try {
    const authHeader = req.header('Authorization')
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return handleErrors(new Error('Access token not found'), res, next)
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as { _id: string }
    req.userId = decoded._id

    const account = await Auth.findById(req.userId)
    if (!account.isVerified) return handleErrors(new Error('Account not verified'), res, next)
    if (!account.refreshToken) return handleErrors(new Error('Refresh token not found'), res, next)
    req.isBusiness = account.isBusiness

    if (next) next()
  } catch (error) {
    return handleErrors(error, res, next)
  }
}

const handleErrors = (error: Error, res: Response, next?: NextFunction) => {
  if (!next) throw new Error(error.message)
  else return res.status(401).json({ message: 'Unauthorized', error: error.message })
}
