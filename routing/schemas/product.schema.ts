import Joi from 'joi'
import { CurrentType } from '@/models/product.model'
import { objectIdValidator } from '@/middlewares/joi'

export const createProductSchema = {
  body: Joi.object({
    name: Joi.string().required(),
    varietyId: Joi.string().custom(objectIdValidator, 'valid ObjectId').required(),
    landId: Joi.string().custom(objectIdValidator, 'valid ObjectId').required(),
    inspectorId: Joi.string().custom(objectIdValidator, 'valid ObjectId').required()
  })
}

export const updateProductSchema = {
  body: Joi.object({
    productId: Joi.string().custom(objectIdValidator, 'valid ObjectId').required(),
    name: Joi.string().optional(),
    desc: Joi.string().optional(),
    current: Joi.string()
      .valid(...Object.values(CurrentType))
      .optional(),

    varietyId: Joi.string().custom(objectIdValidator, 'valid ObjectId').optional(),
    landId: Joi.string().custom(objectIdValidator, 'valid ObjectId').optional(),

    quality: Joi.number().min(0).max(5).optional(),
    cert: Joi.string().optional()
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
    businessId: Joi.string().custom(objectIdValidator, 'valid ObjectId').when('code', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.forbidden()
    }),

    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(20).optional(),

    filterCurrent: Joi.array()
      .items(Joi.valid(Joi.string().valid(...Object.values(CurrentType))))
      .optional(),

    searchValue: Joi.string().optional()
  })
}

export const getProductDetailSchema = {
  params: Joi.object({
    productId: Joi.string().custom(objectIdValidator, 'valid ObjectId').required()
  })
}

export const handleRecordSchema = {
  body: Joi.object({
    productId: Joi.string().custom(objectIdValidator, 'valid ObjectId').required(),
    code: Joi.string().required(),
    businessId: Joi.string().custom(objectIdValidator, 'valid ObjectId').required(),

    isHarvested: Joi.number().min(-1).max(1).required(),

    img: Joi.array()
      .items(Joi.string())
      .when('isHarvested', {
        is: -1,
        then: Joi.forbidden(),
        otherwise: Joi.array().items(Joi.string()).required()
      }),
    desc: Joi.string().when('isHarvested', {
      is: -1,
      then: Joi.forbidden(),
      otherwise: Joi.string().required()
    })
  })
}
