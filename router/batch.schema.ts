import Joi from 'joi'
import { objectIdValidator } from '../utils'

const validTypes = ['land', 'variety']

export const getAllItemsSchema = {
  params: Joi.object({
    type: Joi.string()
      .valid(...validTypes)
      .required()
  })
}

export const updateAllItemsSchema = {
  params: Joi.object({
    type: Joi.string()
      .valid(...validTypes)
      .required()
  }),
  body: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          itemId: Joi.string().custom(objectIdValidator, 'valid ObjectId').optional(),
          quantity: Joi.number().optional(),
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
