import { Request } from 'express'
import { Batch, IBatch, IItem, Item } from '@/models'
import { FilterQuery, Types } from 'mongoose'
import { ItemType } from '@/models/batch.model'

export const getOrCreateBatch = async (userId: Types.ObjectId): Promise<IBatch> => {
  let batch = await Batch.findById(userId)
  if (!batch) {
    const objectId = new Types.ObjectId(userId)
    batch = new Batch({ _id: objectId })
    await batch.save()
  }

  return batch
}

export const batchController = {
  getAllItems: async (req: Request) => {
    const { type, page = 1, limit = 10, sortBy, order = 'asc', filterBy, filterValue } = req.query

    const filter: FilterQuery<IItem> = { businessId: req.userId, type: type as ItemType }

    if (filterBy && filterValue) {
      filter[filterBy as keyof IItem] = filterValue
    }

    const skip = (Number(page) - 1) * Number(limit)
    const limitValue = Number(limit)

    let sort = {}
    if (sortBy) {
      const sortOrder = order === 'asc' ? 1 : -1
      sort = { [sortBy as string]: sortOrder }
    }

    const items = await Item.find(filter).sort(sort).skip(skip).limit(limitValue)
    const totalItems = await Item.countDocuments(filter)

    return {
      totalItems,
      items,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limitValue)
    }
  },

  updateItem: async (req: Request) => {
    const { type, _id, name } = req.body

    let item: IItem
    if (_id) {
      item = await Item.findById(_id)
      if (!item) {
        throw new Error('Item not found')
      }
    }

    item = item || new Item()
    item.businessId = req.userId
    item.type = type
    item.name = name
    await item.save()
  },

  getBatchCode: async (req: Request) => {
    const batch = await getOrCreateBatch(req.userId)
    return batch.code
  },

  updateBatchCode: async (req: Request) => {
    const { code } = req.query
    const batch = await getOrCreateBatch(req.userId)
    batch.code = code as string
    await batch.save()
  }
}
