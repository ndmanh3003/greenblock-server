import { Request, Response } from 'express'
import { IBigNumber, toNumber, toRecord } from './../../utils'
import { Product, Batch, allCurrent, roleCurrent, IProduct, Item } from '../models'
import { verifyToken } from '../../middleware'
import { contractInstance } from '../../plugins'
import { Types } from 'mongoose'

const verifyCode = async (req: Request) => {
  const { code, businessId } = req.body
  const business = await Batch.findOne({ code, business: businessId })
  if (!business) throw new Error('Invalid code')
}

const joinBatch = async (product: IProduct) => {
  const batch = await Batch.findOne({ business: product.business._id })
  if (!batch) return

  const landBatch = await Item.findOneWithDeleted({ _id: product.land })
  if (!landBatch) product.land = 'Not found'
  else product.land = landBatch.name + (landBatch.deleted ? ' (deleted)' : '')

  const varietyBatch = await Item.findOneWithDeleted({ _id: product.variety })
  if (!varietyBatch) product.variety = 'Not found'
  else product.variety = varietyBatch.name + (varietyBatch.deleted ? ' (deleted)' : '')
}

export const productController = {
  createProduct: async (req: Request, res: Response) => {
    try {
      const { name, variety, land, inspector, quantityIn } = req.body
      if (quantityIn <= 0) return res.status(400).json({ message: 'Invalid quantity' })

      // batch
      const batch = await Batch.findOne({ business: req.userId })

      const landId = batch.land.find((l) => l == land)
      if (!landId) return res.status(400).json({ message: 'Land not found' })
      const landBatch = await Item.findById(land)

      const varietyId = batch.variety.find((v) => v == variety)
      if (!varietyId) return res.status(400).json({ message: 'Variety not found or not enough' })
      const varietyBatch = await Item.findById(variety)

      if (varietyBatch.metadata.quantity < quantityIn) return res.status(400).json({ message: 'Variety not enough' })

      // record
      const tx = await contractInstance.createRecord()
      const receipt = await tx.wait()
      const event = receipt.events.find(
        (event: { event: string; args: { id: IBigNumber } }) => event.event === 'RecordCreated'
      )
      const newProduct = new Product({
        name,
        variety,
        land,
        business: req.userId,
        inspector,
        quantityIn,
        record: toNumber(event.args.id)
      })
      await newProduct.save()

      // batch
      landBatch.product.push(newProduct._id as Types.ObjectId)
      varietyBatch.product.push(newProduct._id as Types.ObjectId)
      varietyBatch.metadata.quantity -= quantityIn
      await batch.save()
      await landBatch.save()
      await varietyBatch.save()

      return res.status(201).json({ message: 'Product created successfully', data: newProduct })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create product', error: error.message })
    }
  },

  getAllProducts: async (req: Request, res: Response) => {
    try {
      let query = {}

      if (req.header('Authorization')) {
        await verifyToken(req, res)
        if (req.isBusiness) query = { business: req.userId }
        else query = { current: { $ne: allCurrent.PLANTING }, inspector: req.userId }
      } else {
        await verifyCode(req)
        query = {
          business: req.body.businessId,
          current: { $in: Object.values(roleCurrent.farmer) }
        }
      }

      const products = await Product.find(query).populate('business', 'name').populate('inspector', 'name')
      await Promise.all(
        products.map(async (product: IProduct) => {
          await joinBatch(product)
        })
      )

      return res.status(200).json({ message: 'Products retrieved successfully', data: products })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve products', error: error.message })
    }
  },

  getProductDetails: async (req: Request, res: Response) => {
    try {
      const { productId } = req.params
      let query = {}

      if (req.header('Authorization')) {
        await verifyToken(req, res)
        if (req.isBusiness) query = { business: req.userId }
        else query = { current: { $ne: allCurrent.PLANTING }, inspector: req.userId }
      } else query = { current: { $in: Object.values(roleCurrent.business) } }

      const product = await Product.findOne({ _id: productId, ...query })
        .populate('business', 'name')
        .populate('inspector', 'name')
      if (!product) return res.status(404).json({ message: 'Product not found' })

      await joinBatch(product)
      const record = await contractInstance.getRecord(product.record)

      return res
        .status(200)
        .json({ message: 'Product retrieved successfully', data: { ...product.toObject(), record: toRecord(record) } })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve product', error: error.message })
    }
  },

  deleteProduct: async (req: Request, res: Response) => {
    try {
      const { productId } = req.params
      const deletedProduct = await Product.findOne({ _id: productId, business: req.userId })
      if (!deletedProduct) return res.status(404).json({ message: 'Product not found' })

      await deletedProduct.delete()

      return res.status(200).json({ message: 'Product deleted successfully' })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to delete product', error: error.message })
    }
  },

  updateProduct: async (req: Request, res: Response) => {
    try {
      const { isBusiness, userId } = req
      const { productId, name, desc, current, quantityOut, inspector, quality, cert } = req.body
      let product

      if (isBusiness) {
        if (current && !roleCurrent.business.includes(current))
          return res.status(400).json({ message: 'Invalid status' })

        product = await Product.findOneAndUpdate(
          { _id: productId, business: userId },
          { name, desc, current, quantityOut, inspector }
        )
      } else {
        if (!current || !roleCurrent.inspector.includes(current))
          return res.status(400).json({ message: 'Invalid status' })

        if (current == allCurrent.INSPECTED && !cert && !quality)
          return res.status(400).json({ message: 'Cert and quality are required' })

        product = await Product.findOneAndUpdate(
          { _id: productId, inspector: userId, current: { $ne: allCurrent.PLANTING } },
          { cert, quality, current }
        )
      }

      if (!product) return res.status(404).json({ message: 'Product not found' })

      return res.status(200).json({ message: 'Product updated successfully' })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update product', error: error.message })
    }
  },

  handleStatus: async (req: Request, res: Response) => {
    try {
      await verifyCode(req)

      const { isDelete } = req.params
      const { productId, img, desc, isHarvested, businessId, quantityOut } = req.body

      const product = await Product.findOne({
        _id: productId,
        business: businessId,
        current: { $in: Object.values(roleCurrent.farmer) }
      })
      if (!product) return res.status(404).json({ message: 'Product not found or not in planting' })

      if (isDelete) {
        await contractInstance.removeLatestStatus(product.record)
        product.current = allCurrent.PLANTING
        await product.save()
        return res.status(200).json({ message: 'Status deleted successfully' })
      }

      await contractInstance.addStatus(product.record, desc, img, Boolean(isHarvested))
      if (isHarvested) {
        product.current = allCurrent.HARVESTED
        product.quantityOut = quantityOut
      }
      await product.save()

      return res.status(200).json({ message: 'Status added successfully' })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update status', error: error.message })
    }
  }
}
