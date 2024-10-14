import { Request, Response, NextFunction } from 'express'
import { CustomHelpers, ObjectSchema } from 'joi'
import { Types } from 'mongoose'
import CustomErr from './errorHandler'

export default function validateSchema(schema: {
  body?: ObjectSchema
  query?: ObjectSchema
  params?: ObjectSchema
  [key: string]: ObjectSchema | undefined
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: string[] = []

    ;['body', 'query', 'params'].forEach((key) => {
      if (schema[key]) {
        const { error } = schema[key].validate(req[key as keyof typeof req], { convert: true })
        if (error) {
          validationErrors.push(...error.details.map((detail) => detail.message))
        }
      }
    })

    if (validationErrors.length > 0) {
      throw new CustomErr(validationErrors.join(', '), 400)
    }

    next()
  }
}

export function objectIdValidator(value: string, helpers: CustomHelpers) {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid')
  }
  return value
}
