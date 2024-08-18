import Joi from 'joi'
import { objectIdValidator } from '../utils'

const validTypes = ['land', 'variety']

export const getAllItemsSchema = {
  param: Joi.object({
    type: Joi.string()
      .valid(...validTypes)
      .required()
  })
}

export const updateAllItemsSchema = {
  body: Joi.object({
    type: Joi.string()
      .valid(...validTypes)
      .required(),
    items: Joi.array()
      .items(
        Joi.object({
          itemId: Joi.string().custom(objectIdValidator, 'valid ObjectId').optional(),
          quantity: Joi.number().min(0).optional(),
          name: Joi.string().when('itemId', {
            is: Joi.exist(),
            then: Joi.optional(),
            otherwise: Joi.required()
          })
        })
      )
      .required()
  })
}

export const updateBatchCodeSchema = {
  params: Joi.object({
    code: Joi.string().required()
  })
}
