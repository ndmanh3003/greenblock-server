const { getDetail } = require('../../utils/getDetail')
const { IBigNumber, toNumber } = require('../../utils/bcConverter')
const { Request, Response } = require('express')
const contractInstance = require('../../plugins/bc')
const verifyToken = require('../../middleware/auth')
const { Resource, Auth } = require('../models')

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

      if (product.type != 'exported')
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
        business.name,
        req.userId,
        inspector.name,
        inspectorId,
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
      //! Product: 0: planting, 1: harvested, 2: inspected, 3: exported
      //! Action: 0: history, 1: harvest, 2: export, 3: delete

      const { productId, businessId, isFarmer, phone, type: typeAction, desc, img } = req.body

      // Check action type
      if ((isFarmer && typeAction === 2) || (!isFarmer && typeAction !== 2))
        return res.status(400).json({ message: 'Invalid operation for user type' })

      // Check status type
      const productType = await contractInstance.getType(productId)
      if (
        (typeAction === 0 && productType != 0) ||
        (typeAction === 1 && productType != 0) ||
        (typeAction === 2 && productType != 2) ||
        (typeAction === 3 && productType != 0)
      )
        return res.status(400).json({ message: 'This operation is not allowed for the current status' })

      // Check employee access
      const resource = await Resource.findOne({ business: businessId })
      const isEmployee = isFarmer ? resource.farmers.includes(phone) : resource.processors.includes(phone)

      if (!isEmployee) return res.status(403).json({ message: 'Access denied: Not an employee' })

      // Check product ownership
      const product = await getDetail(productId)
      if (product.business.id !== businessId) {
        return res.status(403).json({ message: 'Access denied: Product does not belong to your company' })
      }

      // Update status
      const statusData = {
        desc: typeAction === 3 ? '' : desc,
        img: typeAction === 3 ? [] : img
      }

      const tx = await contractInstance.handleStatus(productId, statusData.desc, statusData.img, typeAction)
      await tx.wait()

      return res.status(200).json({ message: 'Status updated successfully' })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update status', error: error.message })
    }
  }
}

module.exports = productController
