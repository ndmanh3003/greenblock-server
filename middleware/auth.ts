const { Request, Response, NextFunction } = require('express')
const jwt = require('jsonwebtoken')
const { Auth } = require('../app/models')
require('dotenv').config()

const verifyToken = async (req: typeof Request, res: typeof Response, next: typeof NextFunction) => {
  const authHeader = req.header('Authorization')
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.status(401).json('Access denied')

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    req.userId = decoded._id

    // Check logout
    const account = await Auth.findById(req.userId)

    if (!account.refreshToken) return res.status(401).json('Access denied')
    next()
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

module.exports = verifyToken
