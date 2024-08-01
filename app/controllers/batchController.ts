import { Request, Response } from 'express'
import { IBatch, ILand, IVariety, Batch } from './../models'

const findBatch = async (userId: string): Promise<IBatch> => {
  let batch = await Batch.findOne({ business: userId })

  if (!batch) {
    batch = new Batch({ business: userId })
    await batch.save()
  }

  return batch
}

const isValidType = (type: string): type is 'land' | 'variety' => {
  return type === 'land' || type === 'variety'
}

export const batchController = {
  getAllItems: async (req: Request, res: Response) => {
    try {
      const { type } = req.params
      if (!isValidType(type)) throw new Error('Invalid item type')

      const batch = await findBatch(req.userId)
      const items = batch[type].filter((item) => !item.isDeleted)

      let additionalData = {}
      if (type === 'land') {
        const empty = items.filter((land: ILand) => land.product.length === 0).length
        const planting = items.length - empty
        additionalData = { empty, planting }
      } else {
        const empty = items.filter((variety: IVariety) => variety.quantity === 0).length
        const available = items.length - empty
        additionalData = { empty, available }
      }

      return res.status(200).json({
        message: 'Items retrieved successfully',
        data: { items: items, ...additionalData, code: batch.code }
      })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve items', error: error.message })
    }
  },

  updateAllItemNames: async (req: Request, res: Response) => {
    try {
      const { type } = req.params
      if (!isValidType(type)) throw new Error('Invalid item type')

      const items: { name: string; quantity?: number; itemId?: string }[] = req.body.items

      const batch = await findBatch(req.userId)
      batch[type].forEach((item) => (item.isDeleted = true))

      items.forEach((item) => {
        const existingItem = batch[type].find((i) => i._id == item.itemId)

        if (existingItem) {
          // update existing item
          existingItem.name = item.name || existingItem.name
          existingItem.isDeleted = false
          if (type === 'variety') {
            const varietyItem = existingItem as IVariety
            varietyItem.quantity = Math.max(item.quantity || 0, 0) || varietyItem.quantity
          }
        } else {
          // add new item
          batch[type].push({
            name: item.name,
            isDeleted: false,
            ...(type === 'land' ? { isPlanting: false } : { quantity: Math.max(item.quantity || 0, 0) })
          } as ILand & IVariety)
        }
      })

      await batch.save()

      return res.status(200).json({ message: 'Item names updated successfully' })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update item names', error: error.message })
    }
  },

  updateBatchCode: async (req: Request, res: Response) => {
    try {
      const { code } = req.params

      const batch = await findBatch(req.userId)
      batch.code = code
      await batch.save()

      return res.status(200).json({ message: 'Batch code updated successfully' })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update batch code', error: error.message })
    }
  }
}
