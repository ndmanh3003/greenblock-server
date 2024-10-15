import { objectIdValidator } from '@/middlewares/joi'
import { ItemType } from '@/models/batch.model'
import Joi from 'joi'
import { Item } from './../../models/index'

export const getAllItemsSchema = {
  query: Joi.object({
    type: Joi.string()
      .valid(...Object.values(ItemType))
      .required(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(20).optional(),

    sortBy: Joi.string()
      .valid(...Object.values(Object.keys(Item.schema.paths)))
      .optional(),
    order: Joi.string().valid('asc', 'desc').optional(),

    filterBy: Joi.string()
      .valid(...Object.values(Object.keys(Item.schema.paths)))
      .optional(),
    filterValue: Joi.string().optional()
  })
}

export const updateItemSchema = {
  body: Joi.object({
    type: Joi.string()
      .valid(...Object.values(ItemType))
      .required(),
    _id: Joi.string().custom(objectIdValidator, 'valid ObjectId').optional(),
    name: Joi.string().min(3).max(30).required()
  })
}

export const updateBatchCodeSchema = {
  query: Joi.object({
    code: Joi.string().min(3).max(30).required()
  })
}
