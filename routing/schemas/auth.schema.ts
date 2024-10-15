import { objectIdValidator } from '@/middlewares/joi'
import Joi from 'joi'

export const registerSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
    isBusiness: Joi.boolean().required(),
    cert: Joi.string().required()
  })
}

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
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
  query: Joi.object({
    // type: Joi.string().valid('business', 'inspector').required(),
    adminCode: Joi.string().optional()
  })
}
