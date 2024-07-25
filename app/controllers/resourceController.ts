const { Request, Response } = require('express')
const { Resource } = require('../models')

const _type = ['farmers', 'processors', 'varities', 'lands']

const resourceController = {
  updateResource: async (req: typeof Request, res: typeof Response) => {
    try {
      const { userId } = req
      const resourceType = _type[Number(req.params.type)]

      if (!resourceType) return res.status(400).json({ message: 'Invalid resource type' })

      const uniqueData = Array.from(new Set(req.body.data.map((item: unknown) => String(item))))

      const updatedResource = await Resource.findOneAndUpdate(
        { business: userId },
        { [resourceType]: uniqueData },
        { new: true, upsert: true }
      )

      if (!updatedResource) return res.status(404).json({ message: 'Resource not found' })

      return res.status(200).json({ message: 'Resource updated successfully', data: updatedResource[resourceType] })
    } catch (error) {
      return res.status(500).json({ message: 'An error occurred while updating the resource', error: error.message })
    }
  },

  getResource: async (req: typeof Request, res: typeof Response) => {
    try {
      const { userId } = req
      const resourceType = _type[Number(req.params.type)]

      if (!resourceType) return res.status(400).json({ message: 'Invalid resource type' })

      let resource = await Resource.findOne({ business: userId })
      if (!resource) resource = await Resource.create({ business: userId })

      return res.status(200).json({ message: 'Resource retrieved successfully', data: resource[resourceType] })
    } catch (error) {
      return res.status(400).json({ message: 'An error occurred while retrieving the resource', error: error.message })
    }
  }
}

module.exports = resourceController
