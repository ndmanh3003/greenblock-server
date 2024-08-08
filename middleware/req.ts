import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'

export const validateSchema = (schema: {
  body?: Joi.ObjectSchema
  query?: Joi.ObjectSchema
  params?: Joi.ObjectSchema
  [key: string]: Joi.ObjectSchema | undefined
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: string[] = []

    ;['body', 'query', 'params'].forEach((key) => {
      if (schema[key]) {
        const { error } = schema[key].validate(req[key as keyof typeof req], { abortEarly: false })
        if (error) validationErrors.push(...error.details.map((detail) => detail.message))
      }
    })

    if (validationErrors.length > 0)
      return res.status(400).json({ message: 'Validation failed', errors: validationErrors })

    next()
  }
}
