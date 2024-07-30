const { ILand, IVariety } = require('../models/Batch')
const { current } = require('../models/Product')
const { Request, Response } = require('express')
const { IBigNumber, toNumber, toRecord } = require('./../../utils/bcConverter')
const { Product, Auth, Batch } = require('../models')
const verifyToken = require('../../middleware/auth')
const contractInstance = require('../../plugins/bc')

const verifyCode = async (req: typeof Request) => {
  const { code, businessId } = req.body
  const business = await Auth.findOne({ code, isBusiness: true, _id: businessId })
  if (!business) throw new Error('Business not found')
}

const productController = {
  createProduct: async (req: typeof Request, res: typeof Response) => {
    try {
      const { name, variety, land, inspector, quanity } = req.body
      const newProduct = new Product({ name, variety, land, business: req.userId, inspector })

      // check land and variety
      const batch = await Batch.findOne({ business: req.userId })

      const landBatch = batch.land.find((l: typeof ILand) => l.name === land && l.isDeleted === false)
      if (!landBatch) return res.status(400).json({ message: 'Land not found' })
      if (landBatch.isPlanting) return res.status(400).json({ message: 'Land is in use' })

      const varietyBatch = batch.variety.find((v: typeof IVariety) => v.name === variety && v.isDeleted === false)
      if (!varietyBatch) return res.status(400).json({ message: 'Variety not found or not enough' })
      if (varietyBatch.quanity < quanity) return res.status(400).json({ message: 'Variety not enough' })

      // create record
      const tx = await contractInstance.createRecord()
      const receipt = await tx.wait()
      const event = receipt.events.find(
        (event: { event: string; args: { id: typeof IBigNumber } }) => event.event === 'RecordCreated'
      )
      newProduct.record = toNumber(event.args[0])

      await newProduct.save()

      // update land and variety
      landBatch.isPlanting = true
      varietyBatch.quanity -= quanity
      await batch.save()

      return res.status(201).json({ message: 'Product created successfully', data: newProduct })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create product', error: error.message })
    }
  },

  updateProduct: async (req: typeof Request, res: typeof Response) => {
    try {
      const { id } = req.params
      const isBusiness = req.isBusiness
      const userId = req.userId
      const updateData = req.body

      if (isBusiness) {
        if (updateData.current !== current.EXPORTED || updateData.current !== current.SOLD)
          return res.status(400).json({ message: 'Invalid current status' })

        if (updateData.export_at || updateData.record || updateData.land || updateData.variety)
          return res.status(400).json({ message: 'Invalid data' })

        if (updateData.current === current.EXPORTED) updateData.export_at = new Date()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
        const { cert, quality, ...restData } = updateData
        await Product.findByIdAndUpdate({ id, business: userId }, restData)
      } else {
        const { cert, quality } = updateData
        if (!cert || !quality) return res.status(400).json({ message: 'Cert and quality are required' })

        await Product.findByIdAndUpdate(
          { id, inspector: userId, current: { $ne: current.PLANTING } },
          {
            cert,
            quality,
            current: {
              $cond: {
                if: { $eq: ['$current', current.HARVESTED] },
                then: current.INSPECTED,
                else: '$current'
              }
            }
          }
        )
      }

      return res.status(200).json({ message: 'Product updated successfully' })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update product', error: error.message })
    }
  },

  deleteProduct: async (req: typeof Request, res: typeof Response) => {
    try {
      const { id } = req.params

      const deletedProduct = await Product.findByIdAndDelete({ id, business: req.userId })
      if (!deletedProduct) return res.status(404).json({ message: 'Product not found' })

      return res.status(200).json({ message: 'Product deleted successfully' })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to delete product', error: error.message })
    }
  },

  getAllProducts: async (req: typeof Request, res: typeof Response) => {
    try {
      let query = {}

      if (req.header('Authorization')) {
        verifyToken(req, res)
        if (req.isBusiness) query = { business: req.userId }
        else query = { current: { $ne: current.PLANTING }, inspector: req.userId }
      } else {
        verifyCode(req)

        query = {
          business: req.body.businessId,
          current: { $in: [current.PLANTING, current.HARVESTED] }
        }
      }
      const products = await Product.find(query).populate('business', 'name').populate('inspector', 'name')

      return res.status(200).json({ message: 'Products retrieved successfully', data: products })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve products', error: error.message })
    }
  },

  getProductDetails: async (req: typeof Request, res: typeof Response) => {
    try {
      const { productId } = req.params
      let query = {}
      toRecord
      if (req.header('Authorization')) {
        verifyToken(req, res)
        if (req.isBusiness) query = { business: req.userId }
        else query = { current: { $ne: current.PLANTING }, inspector: req.userId }
      } else query = { current: { $in: [current.EXPORTED, current.SOLD] } }

      const product = await Product.find({ _id: productId, ...query })
      if (!product) return res.status(404).json({ message: 'Product not found' })

      const record = await contractInstance.getRecord(product.record)
      product.record = toRecord(record)

      return res.status(200).json({ message: 'Product retrieved successfully', data: product })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve product', error: error.message })
    }
  },

  handleStatus: async (req: typeof Request, res: typeof Response) => {
    try {
      verifyCode(req)
      const { isDelete } = req.params
      const { productId, img, desc, isHarvested } = req.body

      const product = await Product.findById(productId)
      if (!product) return res.status(404).json({ message: 'Product not found' })
      if (product.current !== current.PLANTING || product.current !== current.HARVESTED)
        return res.status(400).json({ message: 'Product is not in planting stage' })

      if (isDelete) {
        await contractInstance.removeLatestStatus(product.record)
        product.current = current.PLANTING
        await product.save()

        return res.status(200).json({ message: 'Status deleted successfully' })
      }

      await contractInstance.addStatus(product.record, desc, img, desc, isHarvested)
      product.current = isHarvested ? current.HARVESTED : current.PLANTING
      await product.save()

      return res.status(200).json({ message: 'Status added successfully' })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve product', error: error.message })
    }
  }
}

module.exports = productController
