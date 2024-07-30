const { Request, Response } = require('express')
import { ILand, IVariety } from './../models/Batch'
const { Batch } = require('../models')

const findBatch = async (userId: string) => {
  const batch = await Batch.findOne({ business: userId })

  if (!batch) {
    const newBatch = new Batch({ business: userId })
    await newBatch.save()
    return newBatch
  }

  return batch
}

const checkValidType = (type: string) => {
  if (type !== 'land' && type !== 'variety') throw new Error('Invalid item type')
}

const batchController = {
  getAllItems: async (req: typeof Request, res: typeof Response) => {
    try {
      const { type } = req.params
      checkValidType(type)

      const batch = await findBatch(req.userId)
      const items = batch[type].filter((item: ILand | IVariety) => !item.isDeleted)

      let additionalData = {}
      if (type === 'land') {
        const emptyCount = items.filter((land: ILand) => !land.isPlanting).length
        const plantingCount = items.filter((land: ILand) => land.isPlanting).length
        additionalData = { emptyCount, plantingCount }
      }

      return res.status(200).json({
        message: 'Items retrieved successfully',
        data: { item: items, ...additionalData }
      })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve items', error: error.message })
    }
  },

  updateAllItemNames: async (req: typeof Request, res: typeof Response) => {
    try {
      const { type } = req.params
      checkValidType(type)

      const items: { name: string; quanity?: number }[] = req.body.item
      const batch = await findBatch(req.userId)

      // Delete items no exist
      batch[type].forEach((item: ILand | IVariety) => {
        if (!items.some((i) => i.name == item.name)) item.isDeleted = true
      })

      items.forEach((item) => {
        if (batch[type].some((i: ILand | IVariety) => i.name == item.name)) {
          // Update item name
          const index = batch[type].findIndex((i: ILand | IVariety) => i.name == item.name)

          batch[type][index].isDeleted = false
          batch[type][index].name = item.name
          type === 'variety' && (batch[type][index].quanity = Math.max(item.quanity, 0))
        } else {
          // Add new item
          batch[type].push({
            name: item.name,
            isDeleted: false,
            ...(type === 'land' ? { isPlanting: false } : { quanity: Math.max(item.quanity, 0) })
          })
        }
      })

      await batch.save()

      return res.status(200).json({ message: 'Item names updated successfully' })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update item names', error: error.message })
    }
  }
}

module.exports = batchController
