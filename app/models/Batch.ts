const mongoose = require('mongoose')

export interface ILand {
  _id: string
  name: string
  isPlanting: boolean
  isDeleted: boolean
}

export interface IVariety {
  _id: string
  name: string
  quanity: number
  isDeleted: boolean
}

export interface IBatch {
  _id: string
  land: ILand[]
  variety: IVariety[]
  business: string
}

const landSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 3,
    max: 30
  },
  isPlanting: {
    type: Boolean,
    required: true,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
})
const varietySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 30
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  quanity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  }
})

const batchSchema = new mongoose.Schema({
  land: {
    type: [landSchema],
    required: true,
    default: []
  },
  variety: {
    type: [varietySchema],
    required: true,
    default: []
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    unique: true
  }
})

module.exports = batchSchema
