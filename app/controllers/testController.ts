const { Request, Response } = require('express')
const { Test } = require('../models')

const testController = {
  // ADD TEST
  addTest: async (req: typeof Request, res: typeof Response) => {
    try {
      const newTest = new Test(req.body)
      const savedTest = await newTest.save()
      res.status(201).json(savedTest)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }
}

module.exports = testController
