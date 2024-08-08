import { Request, Response } from 'express'
import { Batch, IBatchPopulated, IBatch, Item, IItem } from '../models'
import { Types } from 'mongoose'

const findBatch = async (userId: string, isPopulated = false): Promise<IBatchPopulated | IBatch> => {
  let batch = await Batch.findOne({ business: userId })
  if (!batch) {
    batch = new Batch({ business: userId })
    await batch.save()
  }

  if (isPopulated) batch = await batch.populate('land variety')

  return batch
}

export const batchController = {
  getAllItems: async (req: Request, res: Response) => {
    try {
      const { type } = req.params as { type: 'land' | 'variety' }

      const batch = (await findBatch(req.userId, true)) as IBatchPopulated
      const items = batch[type]

      let additionalData = {}
      if (type === 'land') {
        const empty = items.filter((land) => !land.product.length).length
        const planting = items.length - empty
        additionalData = { empty, planting }
      } else {
        const empty = items.filter((variety) => variety.metadata.quantity === 0).length
        const available = items.length - empty
        additionalData = { empty, available }
      }

      return res.status(200).json({
        message: 'Items retrieved successfully',
        data: { ...additionalData, items: items, code: batch.code }
      })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve items', error: error.message })
    }
  },

  updateAllItems: async (req: Request, res: Response) => {
    try {
      const { type } = req.params as { type: 'land' | 'variety' }
      const items: { name?: string; quantity?: number; itemId?: string }[] = req.body.items

      const batch = (await findBatch(req.userId)) as IBatch

      // Delete items that are not in the new list
      const itemIdsToKeep = items.map((item) => item.itemId).filter((id) => !!id)
      const itemsToRemove = await Item.find({ _id: { $nin: itemIdsToKeep }, type })

      for (const itemToRemove of itemsToRemove) {
        await itemToRemove.delete()
        const index = batch[type].findIndex((i) => i._id == itemToRemove._id)
        if (index > -1) batch[type].splice(index, 1)
      }

      for (const item of items) {
        if (item.itemId) {
          // Update existing item
          const updatedItem: IItem = await Item.findOneAndUpdateWithDeleted(
            { _id: item.itemId, type },
            {
              ...(item.name && { name: item.name }),
              ...(type === 'variety' && item.quantity != undefined && { 'metadata.quantity': item.quantity || 0 })
            },
            { new: true, runValidators: true }
          )

          if (updatedItem?.deletedAt) {
            await updatedItem.restore() // Restore if deleted
            const id = updatedItem._id as Types.ObjectId
            if (!batch[type].includes(id)) batch[type].push(id)
          }
        } else {
          // Create new item
          const newItem = new Item({
            name: item.name,
            type,
            ...(type === 'variety' && { 'metadata.quantity': item.quantity || 0 })
          })
          await newItem.save()
          batch[type].push(newItem._id as Types.ObjectId)
        }
      }

      await batch.save()

      return res.status(200).json({ message: 'Items updated successfully' })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update items', error: error.message })
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
