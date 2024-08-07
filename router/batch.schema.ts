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
          name: Joi.string().optional(),
          itemId: Joi.string().custom(objectIdValidator, 'valid ObjectId').optional(),
          quantity: Joi.when('..type', {
            is: 'variety',
            then: Joi.number().optional(),
            otherwise: Joi.forbidden()
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
