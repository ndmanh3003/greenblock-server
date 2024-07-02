const { getDetail } = require('../../utils/getDetail')
const { IBigNumber, toNumber } = require('../../utils/bcConverter')
const { Request, Response } = require('express')
const contractInstance = require('../../plugins/bc')
const verifyToken = require('../../middleware/auth')
const { Resource, Auth } = require('../models')

const productController = {
  // Get all products with roles: business, inspector, employee
  getProducts: async (req: typeof Request, res: typeof Response) => {
    try {
      let products
      if (req.header('Authorization')) {
        await verifyToken(req, res)
        req.body.isFarmer = 2
      } else {
        const resource = await Resource.findOne({ business: req.body.businessId })
        const isEmployee = req.body.isFarmer
          ? resource.farmers.includes(req.body.phone)
          : resource.processors.includes(req.body.phone)
        if (!isEmployee) return res.status(403).send('You are not a employee')
        req.isBusiness = 1
      }
      products = await contractInstance.getProducts(
        req.userId || req.body.businessId,
        Number(req.isBusiness),
        Number(req.body.isFarmer)
      )
      products = products.map((index: typeof IBigNumber) => toNumber(index))
      const productDetails = []
      for (let i = 0; i < products.length; i++) productDetails.push(await getDetail(products[i]))

      return res.status(200).send(productDetails)
    } catch (error) {
      res.status(400).send(error.message)
    }
  },
  // Get product by id with roles: consumer
  getProductById: async (req: typeof Request, res: typeof Response) => {
    try {
      const typeProduct = await contractInstance.getType(req.params.id)
      if (typeProduct != 3) return res.status(400).send('This product is not traceable for trading')
      const product = await getDetail(req.params.id)

      return res.status(200).send(product)
    } catch (error) {
      res.status(400).send(error.message)
    }
  },
  // Create a new product with role: business
  createProduct: async (req: typeof Request, res: typeof Response) => {
    try {
      const business = await Auth.findById(req.userId)
      const inspector = await Auth.findOne({
        _id: req.body.inspectorId,
        isBusiness: false,
        isVerified: true
      })

      if (!inspector) return res.status(400).send('Inspector not found')
      const tx = await contractInstance.createProduct(
        req.body.name,
        req.body.variety,
        req.body.location,
        business.name,
        req.userId,
        inspector.name,
        req.body.inspectorId,
        req.body.desc
      )
      const receipt = await tx.wait()
      const event = receipt.events.find(
        (event: { event: string; args: { productId: typeof IBigNumber } }) => event.event === 'ProductCreated'
      )
      const productId = toNumber(event.args[0])

      res.status(200).json(productId)
    } catch (error) {
      res.status(400).send(error.message)
    }
  },
  // Update product with roles: business, inspector
  updateProduct: async (req: typeof Request, res: typeof Response) => {
    try {
      const product = await getDetail(req.body.id)
      if (req.isBusiness) {
        if (product.business.id !== req.userId) return res.status(400).send('This product does not belong to you')
        if (req.body.imgCert) return res.status(400).send('You can not update image certificate')
      }
      if (!req.isBusiness && product.inspector.id !== req.userId)
        return res.status(400).send('You are not allowed to inspect this product')

      const tx = await contractInstance.updateProduct(
        req.body.id,
        req.body.name || '',
        req.body.variety || '',
        req.body.location || '',
        req.body.desc || '',
        req.body.imgCert || ''
      )
      await tx.wait()

      res.status(200).json('OK')
    } catch (error) {
      res.status(400).send(error.message)
    }
  },
  // Handle stauts with 4 types: 0: history, 1: harvest, 2: export, 3: delete
  handleStatus: async (req: typeof Request, res: typeof Response) => {
    try {
      if ((req.body.isFarmer && req.body.type == 2) || (!req.body.isFarmer && req.body.type != 2))
        return res.status(400).send('Your action is not allowed')

      if (req.body.type == 2) {
        const typeProduct = await contractInstance.getType(req.body.productId)
        if (typeProduct != 2) return res.status(400).send('This product is not exportable or has already been exported')
      }
      const resource = await Resource.findOne({ business: req.body.businessId })
      const isEmployee = req.body.isFarmer
        ? resource.farmers.includes(req.body.phone)
        : resource.processors.includes(req.body.phone)
      if (!isEmployee) return res.status(403).send('You are not a employee')

      const product = await getDetail(req.body.productId)
      if (product.business.id != req.body.businessId)
        return res.status(400).send('This product does not belong to your company')

      if (req.body.type == 3) {
        req.body.desc = ''
        req.body.img = []
      }
      const tx = await contractInstance.handleStatus(req.body.productId, req.body.desc, req.body.img, req.body.type)
      await tx.wait()

      res.status(200).json('OK')
    } catch (error) {
      res.status(400).send(error.message)
    }
  }
}

module.exports = productController
