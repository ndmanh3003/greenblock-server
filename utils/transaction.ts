import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
  session: mongoose.ClientSession
) => Promise<unknown>

export function withTransaction(fn: AsyncFunction) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const result = await fn(req, res, next, session)
      await session.commitTransaction()

      if (result) {
        return res.status(200).json({ message: 'OK', data: result })
      } else {
        return res.status(202).json({ message: 'OK' })
      }
    } catch (error) {
      await session.abortTransaction()
      session.endSession()
      next(error)
    }
  }
}

export function withoutTransaction(fn: AsyncFunction) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = await fn(req, res, next, null)
    return res.status(200).json({ message: 'OK', data: result })
  }
}

export default function wrapControllerWithTransaction<T extends Record<string, AsyncFunction>>(controller: T): T {
  const wrappedController: Partial<T> = {}

  Object.keys(controller).forEach((key) => {
    const originalFn = controller[key]
    if (typeof originalFn === 'function') {
      if (key.startsWith('get')) {
        wrappedController[key as keyof T] = withoutTransaction(originalFn) as unknown as T[keyof T]
      } else {
        wrappedController[key as keyof T] = withTransaction(originalFn) as unknown as T[keyof T]
      }
    }
  })

  return wrappedController as T
}
