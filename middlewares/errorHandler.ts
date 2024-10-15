import { NextFunction, Request, Response } from 'express'

interface IError {
  statusCode?: number
  message?: string
}

export default class CustomError extends Error {
  statusCode: number
  constructor(message: string, statusCode?: number) {
    super(message)
    this.statusCode = statusCode
  }
}

export function errorHandler(err: IError, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  return res.status(statusCode).json({ message })
}
