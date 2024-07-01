const { Request, Response } = require('express')
const { Resource } = require('../models')

const _type = ['farmers', 'processors', 'varities', 'lands']

const resourceController = {
  // Update resource
  updateResource: async (req: typeof Request, res: typeof Response) => {
    try {
      await Resource.findOneAndUpdate(
        { business: req.userId },
        { $addToSet: { [_type[req.params.type]]: { $each: req.body.data } } },
        { new: true }
      )

      res.status(200).json('OK')
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  },
  // Get resource
  getResource: async (req: typeof Request, res: typeof Response) => {
    try {
      const resource = await Resource.findOne({ business: req.userId })
      if (!resource) {
        await Resource.create({ business: req.userId })
      }

      res.status(200).json(resource[_type[req.params.type]])
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }
}

module.exports = resourceController
