import Joi from 'joi'
import { objectIdValidator } from '../utils'

export const registerSchema = {
  body: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    isBusiness: Joi.boolean().required(),
    cert: Joi.string().required()
  })
}

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    isBusiness: Joi.boolean().required()
  })
}

export const verifyAccountSchema = {
  body: Joi.object({
    accountId: Joi.string().custom(objectIdValidator, 'valid ObjectId').required(),
    isVerified: Joi.boolean().required()
  })
}

export const refreshTokenSchema = {
  params: Joi.object({
    refreshToken: Joi.string().required()
  })
}

export const getAllAccountsSchema = {
  params: Joi.object({
    type: Joi.string().valid('business', 'inspector').required()
  }),
  body: Joi.object({
    admin_pass: Joi.string().optional()
  })
}
