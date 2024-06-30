const { Request, Response } = require('express')
const { Test } = require('../models')

const testController = {
  // Add test
  addTest: async (req: typeof Request, res: typeof Response) => {
    try {
      const newTest = new Test(req.body)
      const savedTest = await newTest.save()
      res.status(201).json(savedTest)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  },

  // Get all tests
  getTests: async (req: typeof Request, res: typeof Response) => {
    try {
      const tests = await Test.find()
      res.status(200).json(tests)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  },

  // Get test by id
  getTestById: async (req: typeof Request, res: typeof Response) => {
    try {
      const test = await Test.findById(req.params.id)
      res.status(200).json(test)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  },

  // Update test
  updateTest: async (req: typeof Request, res: typeof Response) => {
    try {
      await Test.findByIdAndUpdate(req.params.id, { $set: req.body })
      res.status(200).json('Updated successfully')
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  },

  // Delete test
  deleteTest: async (req: typeof Request, res: typeof Response) => {
    try {
      await Test.findByIdAndDelete(req.params.id)
      res.status(200).json('Deleted successfully')
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }
}

module.exports = testController
