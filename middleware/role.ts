import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '.'

export const isBusiness = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await verifyToken(req, res)
    if (!req.isBusiness) return res.status(401).json({ message: 'Permission denied' })
    next()
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const isInspector = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await verifyToken(req, res)
    if (req.isBusiness) return res.status(401).json({ message: 'Permission denied' })
    next()
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}
