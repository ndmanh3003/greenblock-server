const mongoose = require('mongoose')

export interface IResource {
  _id: string
  farmers: string[]
  processors: string[]
  varities: string[]
  lands: string[]
  business: string
}

const sourceSchema = new mongoose.Schema(
  {
    farmers: {
      type: [String],
      default: []
    },
    processors: {
      type: [String],
      default: []
    },
    varities: {
      type: [String],
      default: []
    },
    lands: {
      type: [String],
      default: []
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auth',
      required: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = sourceSchema
