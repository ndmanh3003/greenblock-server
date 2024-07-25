const { Request, Response, NextFunction } = require('express')
const jwt = require('jsonwebtoken')
const { Auth } = require('../app/models')
require('dotenv').config()

const verifyToken = async (req: typeof Request, res: typeof Response, next?: typeof NextFunction) => {
  try {
    const authHeader = req.header('Authorization')
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return handleErrors(new Error('Access token not found'), res, next)
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
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

export const handleErrors = (error: Error, res: typeof Response, next?: typeof NextFunction): void => {
  if (!next) throw new Error(error.message)
  else return res.status(400).json({ message: error.message })
}

module.exports = verifyToken
