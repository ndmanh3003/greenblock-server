import { Request, Response } from 'express'
import { ILand, IVariety, Batch, IBatchPopulated } from './../models'

const findBatch = async (userId: string): Promise<IBatchPopulated> => {
  let batch = await Batch.findOne({ business: userId })

  if (!batch) {
    batch = new Batch({ business: userId })
    await batch.save()
  }

  return batch.populate('land variety')
}

export const batchController = {
  getAllItems: async (req: Request, res: Response) => {
    try {
      const { type } = req.params as { type: 'land' | 'variety' }

      const batch = await findBatch(req.userId)
      const items = batch[type] as (ILand | IVariety)[]

      let additionalData = {}
      if (type === 'land') {
        const empty = items.filter((land: ILand) => !land.product.length).length
        const planting = items.length - empty
        additionalData = { empty, planting }
      } else {
        const empty = items.filter((variety: IVariety) => variety.quantity === 0).length
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
      // const { type } = req.params as { type: 'land' | 'variety' }
      // const items: { name?: string; quantity?: number; itemId?: string }[] = req.body.items

      // const batch = await findBatch(req.userId)
      // const Model = type === 'land' ? Land : Variety

      // // Remove items not present in the incoming items array
      // const itemIdsToKeep = items.map((item) => item.itemId).filter((id) => id)
      // const itemsToRemove = await Model.findOne({
      //   _id: { $nin: itemIdsToKeep },
      //   [type]: batch._id
      // })

      // for (const itemToRemove of itemsToRemove) {
      //   await itemToRemove.delete() // This uses the soft delete functionality
      //   batch[type] = batch[type].filter((id) => !id.equals(itemToRemove._id))
      // }

      // for (const item of items) {
      //   if (item.itemId) {
      //     // Update existing item
      //     const updatedItem = await Model.findByIdAndUpdate(
      //       item.itemId,
      //       {
      //         $set: {
      //           name: item.name,
      //           ...(type === 'variety' && { quantity: Math.max(item.quantity || 0, 0) })
      //         }
      //       },
      //       { new: true, runValidators: true }
      //     )

      //     if (updatedItem.deletedAt) {
      //       await updatedItem.restore() // Restore if soft deleted
      //       if (!batch[type].includes(updatedItem._id)) {
      //         batch[type].push(updatedItem._id)
      //       }
      //     }
      //   } else {
      //     // Create new item
      //     const newItem = new Model({
      //       name: item.name,
      //       ...(type === 'variety' && { quantity: Math.max(item.quantity || 0, 0) }),
      //       [type]: batch._id
      //     })
      //     await newItem.save()
      //     batch[type].push(newItem._id)
      //   }
      // }

      // await batch.save()

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
