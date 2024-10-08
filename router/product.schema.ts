import Joi from 'joi'
import { allCurrent } from '../app/models'
import { objectIdValidator } from '../utils'

export const createProductSchema = {
  body: Joi.object({
    name: Joi.string().required(),
    variety: Joi.string().required(),
    land: Joi.string().required(),
    inspector: Joi.string().required(),
    quantityIn: Joi.number().greater(0).required()
  })
}

export const handleStatusSchema = {
  body: Joi.object({
    productId: Joi.string().custom(objectIdValidator, 'valid ObjectId').required(),
    img: Joi.array()
      .items(Joi.string())
      .when('isDelete', {
        is: true,
        then: Joi.forbidden(),
        otherwise: Joi.array().items(Joi.string()).required()
      }),
    desc: Joi.string().when('isDelete', {
      is: true,
      then: Joi.forbidden(),
      otherwise: Joi.string().required()
    }),
    isHarvested: Joi.boolean().when('isDelete', {
      is: true,
      then: Joi.forbidden(),
      otherwise: Joi.boolean().required()
    }),
    code: Joi.string().required(),
    businessId: Joi.string().custom(objectIdValidator, 'valid ObjectId').required(),
    quantityOut: Joi.when('isHarvested', {
      is: true,
      then: Joi.number().greater(0).required(),
      otherwise: Joi.forbidden()
    }),
    isDelete: Joi.boolean().optional()
  })
}

export const updateProductSchema = {
  body: Joi.object({
    name: Joi.string().optional(),
    desc: Joi.string().optional(),
    current: Joi.string()
      .valid(...Object.values(allCurrent))
      .optional(),
    quantityOut: Joi.number().greater(0).optional(),
    inspector: Joi.string().optional(),
    quality: Joi.number().min(0).max(5).optional(),
    cert: Joi.string().optional(),
    productId: Joi.string().custom(objectIdValidator, 'valid ObjectId').required()
  })
}

export const deleteProductSchema = {
  params: Joi.object({
    productId: Joi.string().custom(objectIdValidator, 'valid ObjectId').required()
  })
}

export const getAllProductsSchema = {
  query: Joi.object({
    code: Joi.string().optional(),
    businessId: Joi.string().custom(objectIdValidator, 'valid ObjectId').optional()
  })
}

export const getProductDetailsSchema = {
  params: Joi.object({
    productId: Joi.string().custom(objectIdValidator, 'valid ObjectId').required()
  })
}
