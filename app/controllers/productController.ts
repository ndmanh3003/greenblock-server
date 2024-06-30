const { IBigNumber, toNumber } = require('../../utils/bcConverter')
const { Request, Response } = require('express')
const contractInstance = require('../../plugins/bc')

const productController = {
  // GET all products with each role
  getProducts: async (req: typeof Request, res: typeof Response) => {
    try {
      const { accountId, role } = req.body
      const products = await contractInstance.getProducts(accountId, role)

      const result = products.map((index: typeof IBigNumber) => toNumber(index))

      res.status(201).json(result)
    } catch (error) {
      res.status(400).send(error.message)
    }
  }
}

module.exports = productController
