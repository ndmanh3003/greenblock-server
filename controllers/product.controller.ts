import { Request } from 'express'
import { IBigNumber, toInfo, toNumber, toRecord } from '@/utils/blockchain'
import { Product, Batch, IProduct, Item, Auth } from '@/models'
import verifyToken from '@/middlewares/auth'
import contractInstance from '@/plugins/blockchain'
import { FilterQuery } from 'mongoose'
import { CurrentType, roleCurrent } from '@/models/product.model'
import CustomError from '@/middlewares/errorHandler'
import { ItemType } from '@/models/batch.model'
import { getOrCreateBatch } from './batch.controller'

const verifyCode = async (code: string, businessId: string) => {
  const business = await Batch.findById(businessId)
  if (!business || business.code != code) {
    throw new CustomError('Invalid code', 400)
  }
}

const rawProductController = {
  createProduct: async (req: Request) => {
    const { name, varietyId, landId, inspectorId } = req.body

    const isValidInspector = await Auth.findOne({ _id: inspectorId, isBusiness: false })
    if (!isValidInspector) {
      throw new CustomError('Invalid inspector', 400)
    }

    const isValidVariety = await Item.findOne({ _id: varietyId, business: req.userId, type: ItemType.variety })
    if (!isValidVariety) {
      throw new CustomError('Invalid variety', 400)
    }

    const isValidLand = await Item.findOne({ _id: landId, business: req.userId, type: ItemType.land })
    if (!isValidLand) {
      throw new CustomError('Invalid land', 400)
    }

    // create record
    const tx = await contractInstance.createRecord()
    const receipt = await tx.wait()
    const event = receipt.events.find(
      (event: { event: string; args: { id: IBigNumber } }) => event.event === 'RecordCreated'
    )

    const newProduct = new Product({
      name,
      record: toNumber(event.args.id),
      business: req.userId,
      variety: varietyId,
      land: landId,
      inspector: inspectorId
    })
    await newProduct.save()
  },

  getAllProducts: async (req: Request) => {
    const { code, businessId, page = 1, limit = 10, filterCurrent, searchValue } = req.query

    const query: FilterQuery<IProduct> = {}

    if (!code) {
      await verifyToken(req, null, null)
      if (req.isBusiness) {
        query.business = req.userId
      } else {
        query.current = { $ne: CurrentType.planting }
        query.inspector = req.userId
      }

      if (searchValue) {
        query.name = { $regex: searchValue, $options: 'i' }
      }
      if (filterCurrent) {
        query.current = { $in: filterCurrent, ...query.current }
      }

      const skip = (Number(page) - 1) * Number(limit)
      const limitValue = Number(limit)

      const products = await Product.find(query)
        .skip(skip)
        .limit(limitValue)
        .populate('business', 'name')
        .populate('inspector', 'name')
        .select('name current business inspector')

      const total = await Product.countDocuments(query)

      return {
        products,
        totalProducts: total,
        currentPage: page,
        limit: Number(limit),
        totalPages: Math.ceil(total / limitValue)
      }
    } else {
      await verifyCode(code as string, businessId as string)
      query.business = businessId
      query.current = { $in: Object.values(roleCurrent.farmer) }

      const products = await Product.find(query).select('name')

      return { products }
    }
  },

  getProductDetail: async (req: Request) => {
    const { productId } = req.params
    let query = {}

    if (req.header('Authorization')) {
      await verifyToken(req, null, null)
      if (req.isBusiness) {
        query = { business: req.userId }
      } else {
        query = { current: { $ne: CurrentType.planting }, inspector: req.userId }
      }
    } else {
      query = { current: { $in: Object.values(roleCurrent.customer) } }
    }

    const product = await Product.findOne({ _id: productId, ...query })
      .populate('business', 'name')
      .populate('inspector', 'name')
      .populate('variety', 'name')
      .populate('land', 'name')
    if (!product) {
      throw new CustomError('Product not found', 404)
    }

    const record = await contractInstance.getRecordDetail(product.record)
    return { ...product.toObject(), record: toRecord(record) }
  },

  deleteProduct: async (req: Request) => {
    const { productId } = req.params
    const deletedProduct = await Product.findOne({ _id: productId, business: req.userId })
    if (!deletedProduct) {
      throw new CustomError('Product not found', 404)
    }

    await deletedProduct.delete()
  },

  updateProduct: async (req: Request) => {
    const { isBusiness, userId } = req
    const { productId, name, desc, current, varietyId, landId, quality, cert } = req.body
    let query = {}
    let update = {}

    if (isBusiness) {
      if (current && !roleCurrent.customer.includes(current)) {
        throw new CustomError('Invalid current', 400)
      }

      query = { business: userId }
      update = { name, desc, current, variety: varietyId, land: landId }
    } else {
      if (!current || !roleCurrent.inspector.includes(current)) {
        throw new CustomError('Invalid current', 400)
      }

      if (current == CurrentType.inspected && !cert && !quality) {
        throw new CustomError('Quality and certificate are required', 400)
      }

      // inspector can only update current when product is harvested or in the statuses of inspector
      query = { inspector: userId, current: { $in: [CurrentType.harvested, ...roleCurrent.inspector] } }
      update = { cert, quality, current }
    }

    // only update current when the product is not in the planting current, meaning after it harvested (this is done by the farmer).
    const product = await Product.findOneAndUpdate(
      { _id: productId, ...query, ...(current ? { current: { $ne: CurrentType.planting } } : {}) },
      update
    )
    if (!product) {
      throw new CustomError('Product not found or not allowed to update', 400)
    }
  },

  handleRecord: async (req: Request) => {
    const { productId, code, businessId, isHarvested, img, desc } = req.body
    await verifyCode(code, businessId)

    const product = await Product.findOne({
      _id: productId,
      business: businessId,
      current: { $in: Object.values(roleCurrent.farmer) }
    })
    if (!product) {
      throw new CustomError('Product not found', 404)
    }

    if (isHarvested == -1) {
      // remove latest status
      const record = await contractInstance.getRecordSummary(4)
      const { statusCount, updatedAt } = toInfo(record)

      if (statusCount === 0) {
        throw new CustomError('Do not have any status to delete', 400)
      }

      const timeAllowed = new Date()
      timeAllowed.setDate(timeAllowed.getDate() - 1)
      if (updatedAt < timeAllowed) {
        throw new CustomError('Cannot delete status after 24 hours', 400)
      }

      await contractInstance.removeLatestStatus(product.record)
      product.current = CurrentType.planting
      await product.save()
    } else {
      if (product.current === CurrentType.harvested) {
        throw new CustomError('Product already harvested', 400)
      }

      await contractInstance.addStatus(product.record, desc, img, Boolean(isHarvested))

      if (isHarvested) {
        product.current = CurrentType.harvested
      }
      await product.save()
    }
  },

  getProductStatistics: async (req: Request) => {
    const pipeline = [
      { $match: { business: req.userId } },
      {
        $group: {
          _id: null as unknown,
          total: { $sum: 1 },
          planting: { $sum: { $cond: [{ $eq: ['$current', CurrentType.planting] }, 1, 0] } },
          harvested: { $sum: { $cond: [{ $eq: ['$current', CurrentType.harvested] }, 1, 0] } },
          inspecting: { $sum: { $cond: [{ $eq: ['$current', CurrentType.inspecting] }, 1, 0] } },
          inspected: { $sum: { $cond: [{ $eq: ['$current', CurrentType.inspected] }, 1, 0] } },
          exported: { $sum: { $cond: [{ $eq: ['$current', CurrentType.exported] }, 1, 0] } },
          sold: { $sum: { $cond: [{ $eq: ['$current', CurrentType.sold] }, 1, 0] } }
        }
      }
    ]

    const [statistics] = await Product.aggregate(pipeline)
    const batch = await getOrCreateBatch(req.userId)

    return {
      total: statistics?.total || 0,
      planting: statistics?.planting || 0,
      harvested: statistics?.harvested || 0,
      inspecting: statistics?.inspecting || 0,
      inspected: statistics?.inspected || 0,
      exported: statistics?.exported || 0,
      sold: statistics?.sold || 0,
      code: batch.code
    }
  }
}

export default rawProductController
