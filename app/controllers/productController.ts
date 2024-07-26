const { getDetail } = require('../../utils/getDetail')
const { IBigNumber, toNumber } = require('../../utils/bcConverter')
const { Request, Response } = require('express')
const contractInstance = require('../../plugins/bc')
const verifyToken = require('../../middleware/auth')
const { Resource, Auth } = require('../models')

// Constants for status types
const STATUS_HISTORY = 0
const STATUS_HARVEST = 1
const STATUS_EXPORT = 2
const STATUS_DELETE = 3

// Constants for product types
const TYPE_PLANTING = 'planting'
// const TYPE_HARVESTED = 'harvested'
const TYPE_INSPECTED = 'inspected'
const TYPE_EXPORTED = 'exported'

const productController = {
  async getProducts(req: typeof Request, res: typeof Response) {
    try {
      let userId, isBusiness

      if (req.header('Authorization')) {
        await verifyToken(req, res)

        isBusiness = Number(req.isBusiness)
        userId = req.userId
        req.body.isFarmer = 2
      } else {
        const resource = await Resource.findOne({ business: req.body.businessId })
        const isEmployee = req.body.isFarmer
          ? resource.farmers.includes(req.body.phone)
          : resource.processors.includes(req.body.phone)
        if (!isEmployee) return res.status(403).json({ message: 'Access denied: Not an employee' })

        userId = req.body.businessId
        isBusiness = 1
      }

      const productIds = await contractInstance.getProducts(userId, isBusiness, Number(req.body.isFarmer))
      const products = await Promise.all(productIds.map((id: typeof IBigNumber) => getDetail(toNumber(id))))

      return res.status(200).json({ message: 'Products retrieved successfully', data: products })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve products', error: error.message })
    }
  },

  async getProductById(req: typeof Request, res: typeof Response) {
    try {
      const productId = req.params.id
      const product = await getDetail(productId)

      if (product.type != TYPE_EXPORTED)
        return res.status(400).json({ message: 'This product is not traceable for trading' })

      return res.status(200).json({ message: 'Product retrieved successfully', data: product })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve product', error: error.message })
    }
  },

  async createProduct(req: typeof Request, res: typeof Response) {
    try {
      const { name, variety, location, inspectorId, desc } = req.body
      const business = await Auth.findById(req.userId)
      const inspector = await Auth.findOne({
        _id: inspectorId,
        isBusiness: false,
        isVerified: true
      })

      if (!inspector) return res.status(400).json({ message: 'Inspector not found or not verified' })

      const tx = await contractInstance.createProduct(
        name,
        variety,
        location,
        req.userId,
        business.name,
        inspectorId,
        inspector.name,
        desc
      )
      const receipt = await tx.wait()
      const event = receipt.events.find(
        (event: { event: string; args: { productId: typeof IBigNumber } }) => event.event === 'ProductCreated'
      )
      const productId = toNumber(event.args[0])

      return res.status(201).json({ message: 'Product created successfully', data: { productId } })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create product', error: error.message })
    }
  },

  async updateProduct(req: typeof Request, res: typeof Response) {
    try {
      const { id, name, variety, location, desc, imgCert } = req.body
      const product = await getDetail(id)

      if (req.isBusiness) {
        if (product.business.id !== req.userId)
          return res.status(403).json({ message: 'Access denied: Product does not belong to you' })
        if (imgCert) return res.status(400).json({ message: 'Business users cannot update certificate images' })
      } else if (product.inspector.id !== req.userId)
        return res.status(403).json({ message: 'Access denied: Not authorized to update this product' })

      const tx = await contractInstance.updateProduct(
        id,
        name || '',
        variety || '',
        location || '',
        desc || '',
        imgCert || ''
      )
      await tx.wait()

      return res.status(200).json({ message: 'Product updated successfully' })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update product', error: error.message })
    }
  },

  async handleStatus(req: typeof Request, res: typeof Response) {
    try {
      const { productId, businessId, isFarmer, phone, type: statusType, desc, img } = req.body

      // Check action - role
      if ((isFarmer && statusType === STATUS_EXPORT) || (!isFarmer && statusType !== STATUS_EXPORT))
        return res.status(400).json({ message: 'Invalid operation for user type' })

      // Check employee - company
      const resource = await Resource.findOne({ business: businessId })
      const isEmployee = isFarmer ? resource.farmers.includes(phone) : resource.processors.includes(phone)
      if (!isEmployee) return res.status(403).json({ message: 'Access denied: Not an employee' })

      // Check employee - product
      const product = await getDetail(productId)
      if (product.business.id !== businessId)
        return res.status(403).json({ message: 'Access denied: Product does not belong to your company' })

      // Check status type
      const productType = product.type
      if (
        (statusType === STATUS_HISTORY && productType != TYPE_PLANTING) ||
        (statusType === STATUS_HARVEST && productType != TYPE_PLANTING) ||
        (statusType === STATUS_EXPORT && productType != TYPE_INSPECTED) ||
        (statusType === STATUS_DELETE && productType != TYPE_PLANTING)
      )
        return res.status(400).json({ message: 'This operation is not allowed for the current status' })

      // Check delete - history
      if (statusType === STATUS_DELETE && product.historyCount == 0)
        return res.status(400).json({ message: 'This product has no history to delete' })

      // Update status
      const statusData = {
        desc: statusType === STATUS_DELETE ? '' : desc,
        img: statusType === STATUS_DELETE ? [] : img
      }

      const tx = await contractInstance.handleStatus(productId, statusData.desc, statusData.img, statusType)
      await tx.wait()

      return res.status(200).json({ message: 'Status updated successfully' })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update status', error: error.message })
    }
  }
}

module.exports = productController
