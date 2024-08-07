import { CustomHelpers, ErrorReport } from 'joi'
import { Types } from 'mongoose'

export const objectIdValidator = (value: string, helpers: CustomHelpers): string | ErrorReport => {
  if (!Types.ObjectId.isValid(value)) return helpers.error('any.invalid')
  return value
}
