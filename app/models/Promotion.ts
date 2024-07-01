const mongoose = require('mongoose')

export interface IPromotion {
  _id: string
  name: string
  desc: string
  link: string
  startDate: Date
  endDate: Date
  business: string
}

const promotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    desc: {
      type: String,
      required: true
    },
    link: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true,
      default: Date.now
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

module.exports = promotionSchema
