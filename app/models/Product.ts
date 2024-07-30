/* eslint-disable no-unused-vars */
const mongoose = require('mongoose')

export enum current {
  PLANTING = 'PLANTING',
  HARVESTED = 'HARVESTED',
  INSPECTED = 'INSPECTED',
  EXPORTED = 'EXPORTED',
  SOLD = 'SOLD'
}

export interface IProduct {
  name: string
  record: number
  desc: string
  quality: number
  cert: string
  variety: string
  land: string
  export_at: Date
  current: current
  business: string
  inspector: string
}

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    record: {
      type: Number,
      required: true
    },
    desc: String,
    quality: Number,
    cert: String,
    variety: {
      type: String,
      required: true
    },
    land: {
      type: String,
      required: true
    },
    export_at: Date,
    current: {
      type: String,
      enum: Object.values(current),
      default: current.PLANTING
    },

    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auth',
      required: true
    },
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auth',
      required: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = productSchema
