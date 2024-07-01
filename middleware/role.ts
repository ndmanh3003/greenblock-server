const { Request, Response, NextFunction } = require('express')
const verifyToken = require('./auth')

const isBusiness = async (req: typeof Request, res: typeof Response, next: typeof NextFunction) => {
  try {
    await verifyToken(req, res)
    if (!req.isBusiness) return res.status(401).json('Permission denied')
    next()
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

const isInspector = async (req: typeof Request, res: typeof Response, next: typeof NextFunction) => {
  try {
    await verifyToken(req, res)
    if (req.isBusiness) return res.status(401).json('Permission denied')
    next()
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

module.exports = { isBusiness, isInspector }
