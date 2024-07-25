const { Request, Response } = require('express')
const { Promotion } = require('../models')

const promotionController = {
  createPromotion: async (req: typeof Request, res: typeof Response) => {
    try {
      let { startDate, endDate } = req.body
      startDate = new Date(startDate || Date.now()).setHours(0, 0, 0, 0)
      endDate = new Date(endDate || Date.now()).setHours(23, 59, 59, 999)

      const newPromotion = new Promotion({
        ...req.body,
        business: req.userId,
        startDate,
        endDate
      })
      await newPromotion.save()

      return res.status(201).json({ message: 'Promotion created successfully', data: newPromotion })
    } catch (error) {
      return res.status(400).json({ message: 'Failed to create promotion', error: error.message })
    }
  },

  updatePromotion: async (req: typeof Request, res: typeof Response) => {
    try {
      const { id, ...updateData } = req.body
      const promotion = await Promotion.findOneAndUpdate({ _id: id, business: req.userId }, updateData, {
        new: true,
        runValidators: true
      })

      if (!promotion) return res.status(404).json({ message: 'Promotion not found' })

      return res.status(200).json({ message: 'Promotion updated successfully', data: promotion })
    } catch (error) {
      return res.status(400).json({ message: 'Failed to update promotion', error: error.message })
    }
  },

  deletePromotion: async (req: typeof Request, res: typeof Response) => {
    try {
      const promotion = await Promotion.findOneAndDelete({ _id: req.params.id, business: req.userId })
      if (!promotion) return res.status(404).json({ message: 'Promotion not found' })

      return res.status(200).json({ message: 'Promotion deleted successfully' })
    } catch (error) {
      return res.status(400).json({ message: 'Failed to delete promotion', error: error.message })
    }
  },

  getAllPromotions: async (req: typeof Request, res: typeof Response) => {
    try {
      let promotions
      if (req.params.id) promotions = await Promotion.find({ business: req.params.id })
      else {
        const now = new Date()
        promotions = await Promotion.find({
          startDate: { $lte: now },
          endDate: { $gte: now }
        }).populate('business', 'name')
      }

      return res.status(200).json({ message: 'Promotions retrieved successfully', data: promotions })
    } catch (error) {
      return res.status(400).json({ message: 'Failed to retrieve promotions', error: error.message })
    }
  }
}

module.exports = promotionController
