const IPromotion = require('../models/Promotion')
const { Request, Response } = require('express')
const { Promotion } = require('../models')

const promotionController = {
  // Create promotion
  createPromotion: async (req: typeof Request, res: typeof Response) => {
    try {
      const newPromotion = new Promotion(req.body)
      newPromotion.business = req.userId
      newPromotion.startDate = newPromotion.startDate.setHours(0, 0, 0, 0)
      newPromotion.endDate = newPromotion.endDate.setHours(23, 59, 59, 999)
      await newPromotion.save()

      res.status(201).json('OK')
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  },
  // Update promotion
  updatePromotion: async (req: typeof Request, res: typeof Response) => {
    try {
      const { id, ...updateData } = req.body
      const promotion = await Promotion.findOne({ _id: id, business: req.userId })
      if (!promotion) res.status(404).json('Promotion not found')
      await promotion.updateOne(updateData)

      res.status(200).json('OK')
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  },
  // Delete promotion
  deletePromotion: async (req: typeof Request, res: typeof Response) => {
    try {
      const promotion = await Promotion.findOne({ _id: req.params.id, business: req.userId })
      if (!promotion) res.status(404).json('Promotion not found')
      await promotion.delete()

      res.sendStatus(204)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  },
  // Get all promotions
  getAllPromotions: async (req: typeof Request, res: typeof Response) => {
    try {
      if (req.params.id) {
        const promotions = await Promotion.find({ business: req.params.id })
        return res.status(200).json(promotions)
      }

      // Get all promotions for happenings
      let promotions = await Promotion.find().populate('business', 'name')
      promotions = promotions.filter(
        (promotion: typeof IPromotion) => promotion.startDate <= Date.now() && promotion.endDate >= Date.now()
      )

      res.status(200).json(promotions)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  },
  // Get deleted promotions
  getDeleted: async (req: typeof Request, res: typeof Response) => {
    try {
      const promotions = await Promotion.findDeleted()

      res.status(200).json(promotions)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }
}

module.exports = promotionController
