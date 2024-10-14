import { NextFunction, Request, Response } from 'express'
import { IBigNumber, toNumber, toRecord } from '@/utils/blockchain'
import { Product, Batch, allCurrent, roleCurrent, IProduct, Item } from '@/models'
import verifyToken from '@/middlewares/auth'
import contractInstance from '@/plugins/blockchain'
import { Types } from 'mongoose'
import { findBatch } from './batch.controller'

const verifyCode = async (code: string, businessId: string) => {
  const business = await Batch.findOne({ code, business: businessId })
  if (!business) {
    throw new Error('Invalid code')
  }
}

const joinBatch = async (product: IProduct) => {
  const batch = await Batch.findOne({ business: product.business._id })
  if (!batch) {
    return
  }

  const landBatch = await Item.findOneWithDeleted({ _id: product.land })
  if (!landBatch) {
    product.land = 'Not found'
  } else {
    product.land = landBatch.name + (landBatch.deleted ? ' (deleted)' : '')
  }

  const varietyBatch = await Item.findOneWithDeleted({ _id: product.variety })
  if (!varietyBatch) {
    product.variety = 'Not found'
  } else {
    product.variety = varietyBatch.name + (varietyBatch.deleted ? ' (deleted)' : '')
  }
}

const removeProductFromLand = async (product: IProduct) => {
  const landBatch = await Item.findById(product.land)
  if (!landBatch) {
    return
  }

  const index = landBatch.product.findIndex((p) => p.equals(product._id as Types.ObjectId))
  if (index == -1) {
    return
  }

  landBatch.product.splice(index, 1)
  await landBatch.save()
}

const productController = {
  createProduct: async (req: Request, res: Response) => {
    try {
      const { name, variety, land, inspector, quantityIn } = req.body

      // batch
      const batch = await Batch.findOne({ business: req.userId })

      const landId = batch.land.find((l) => l == land)
      if (!landId) {
        return res.status(404).json({ message: 'Land not found' })
      }
      const landBatch = await Item.findById(land)

      const varietyId = batch.variety.find((v) => v == variety)
      if (!varietyId) {
        return res.status(404).json({ message: 'Variety not found' })
      }

      const varietyBatch = await Item.findById(variety)
      if (varietyBatch.metadata.quantity < quantityIn) {
        return res.status(400).json({ message: 'Variety not enough' })
      }

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

      return res.status(200).json({ message: 'Product created successfully', data: newProduct })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create product', error: error.message })
    }
  },

  getAllProducts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      let query = {}

      if (req.header('Authorization') && !req?.query?.code) {
        await verifyToken(req, res, next)
        if (req.isBusiness) {
          query = { business: req.userId }
        } else {
          query = { current: { $ne: allCurrent.PLANTING }, inspector: req.userId }
        }
      } else {
        const { code, businessId } = req.query
        await verifyCode(code as string, businessId as string)
        query = {
          business: businessId,
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

  getProductDetails: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params
      let query = {}

      if (req.header('Authorization')) {
        await verifyToken(req, res, next)
        if (req.isBusiness) {
          query = { business: req.userId }
        } else {
          query = { current: { $ne: allCurrent.PLANTING }, inspector: req.userId }
        }
      } else {
        query = { current: { $in: Object.values(roleCurrent.business) } }
      }

      const product = await Product.findOne({ _id: productId, ...query })
        .populate('business', 'name')
        .populate('inspector', 'name')
      if (!product) {
        return res.status(404).json({ message: 'Product not found' })
      }

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
      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' })
      }

      await removeProductFromLand(deletedProduct)
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
      let query = {}
      let update = {}

      if (isBusiness) {
        if (current && (!roleCurrent.business.includes(current) || inspector)) {
          return res.status(400).json({ message: 'Invalid current' })
        }

        query = { business: userId, ...(inspector ? { current: { $in: Object.values(roleCurrent.farmer) } } : {}) }
        update = { name, desc, current, quantityOut, inspector }
      } else {
        if (!current || !roleCurrent.inspector.includes(current)) {
          return res.status(400).json({ message: 'Invalid status' })
        }

        if (current == allCurrent.INSPECTED && !cert && !quality) {
          return res.status(400).json({ message: 'Cert and quality are required' })
        }

        query = { inspector: userId }
        update = { cert, quality, current }
      }

      const product = await Product.findOneAndUpdate(
        { _id: productId, ...query, ...(current ? { current: { $ne: allCurrent.PLANTING } } : {}) },
        update
      )
      if (!product) {
        return res.status(404).json({ message: 'Product not found' })
      }

      return res.status(200).json({ message: 'Product updated successfully' })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update product', error: error.message })
    }
  },

  handleStatus: async (req: Request, res: Response) => {
    try {
      const { isDelete, productId, img, desc, isHarvested, businessId, code, quantityOut } = req.body
      await verifyCode(code, businessId)

      const product = await Product.findOne({
        _id: productId,
        business: businessId,
        current: { $in: Object.values(roleCurrent.farmer) }
      })
      if (!product) {
        return res.status(400).json({ message: 'Product not found or not in planting' })
      }

      if (isDelete) {
        await contractInstance.removeLatestStatus(product.record)
        product.current = allCurrent.PLANTING
        product.quantityOut = null
        await product.save()

        const existedLand = await Item.findOne({ _id: product.land })
        if (existedLand) {
          const index = existedLand.product.findIndex((p) => p.equals(product._id as Types.ObjectId))
          if (index !== -1) {
            return
          }
          existedLand.product.push(product._id as Types.ObjectId)
          await existedLand.save()
        }
        return res.status(200).json({ message: 'Status deleted successfully' })
      }

      await contractInstance.addStatus(product.record, desc, img, isHarvested)
      if (isHarvested) {
        product.current = allCurrent.HARVESTED
        product.quantityOut = quantityOut

        await removeProductFromLand(product)
      }
      await product.save()

      return res.status(200).json({ message: 'Status added successfully' })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update status', error: error.message })
    }
  },

  getOverallProducts: async (req: Request, res: Response) => {
    try {
      const products = await Product.find({ business: req.userId })
      const batch = await findBatch(req.userId, false)

      return res.status(200).json({
        message: 'Overall products retrieved successfully',
        data: {
          total: products.length,
          planting: products.filter((p) => p.current == allCurrent.PLANTING).length,
          harvested: products.filter((p) => p.current == allCurrent.HARVESTED).length,
          inspecting: products.filter((p) => p.current == allCurrent.INSPECTING).length,
          inspected: products.filter((p) => p.current == allCurrent.INSPECTED).length,
          exported: products.filter((p) => p.current == allCurrent.EXPORTED).length,
          sold: products.filter((p) => p.current == allCurrent.SOLD).length,
          code: batch.code
        }
      })
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve overall products', error: error.message })
    }
  }
}

export default productController
