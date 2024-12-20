import { Request } from 'express'
import { Batch, IBatch, IItem, Item } from '@/models'
import { FilterQuery, Types } from 'mongoose'
import { ItemType } from '@/models/batch.model'
import CustomError from '@/middlewares/errorHandler'

export const getOrCreateBatch = async (userId: Types.ObjectId): Promise<IBatch> => {
  let batch = await Batch.findById(userId)
  if (!batch) {
    batch = new Batch({ _id: userId })
    await batch.save()
  }

  return batch
}

const rawBatchController = {
  getAllItems: async (req: Request) => {
    const { type, page = 1, limit, sortBy, order = 'asc', filterBy, filterValue } = req.query

    const filter: FilterQuery<IItem> = { business: req.userId, type: type as ItemType }

    if (filterBy && filterValue) {
      filter[filterBy as keyof IItem] = { $regex: filterValue as string, $options: 'i' }
    }

    const skip = (Number(page) - 1) * Number(limit)
    const limitValue = Number(limit)

    let sort = {}
    if (sortBy) {
      const sortOrder = order === 'asc' ? 1 : -1
      sort = { [sortBy as string]: sortOrder }
    }

    const items = await Item.find(filter).sort(sort).skip(skip).limit(limitValue).select('name updatedAt')
    const totalItems = await Item.countDocuments(filter)

    return {
      totalItems,
      items,
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / limitValue),
      limit: Number(limit)
    }
  },

  updateItem: async (req: Request) => {
    const { type, _id, name } = req.body

    let item: IItem
    if (name) {
      if (_id) {
        item = await Item.findOne({ _id, business: req.userId, type })
        if (!item) {
          throw new CustomError('Item not found', 404)
        }
      }

      item = item || new Item()
      item.business = req.userId
      item.type = type
      item.name = name
      await item.save()
    } else {
      await Item.deleteOne({ _id, business: req.userId, type })
    }
  },

  updateBatchCode: async (req: Request) => {
    const { code } = req.params
    const batch = await getOrCreateBatch(req.userId)
    batch.code = code as string
    await batch.save()
  }
}

export default rawBatchController
