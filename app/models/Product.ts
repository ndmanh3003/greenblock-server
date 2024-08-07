import { Schema } from 'mongoose'

export const allCurrent = {
  PLANTING: 'planting',
  HARVESTED: 'harvested',
  INSPECTING: 'inspecting',
  INSPECTED: 'inspected',
  EXPORTED: 'exported',
  SOLD: 'sold'
}

export const roleCurrent = {
  farmer: [allCurrent.PLANTING, allCurrent.HARVESTED],
  inspector: [allCurrent.INSPECTING, allCurrent.INSPECTED],
  business: [allCurrent.EXPORTED, allCurrent.SOLD]
}

export const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50
    },
    record: {
      type: Number,
      required: true
    },
    desc: String,
    current: {
      type: String,
      default: allCurrent.PLANTING,
      enum: [...Object.values(allCurrent)]
    },
    quantityIn: {
      type: Number,
      required: true,
      min: 1
    },
    quantityOut: Number,
    exportAt: Date,

    // batch
    business: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
      required: true
    },
    variety: {
      type: String,
      required: true
    },
    land: {
      type: String,
      required: true
    },

    // inspector
    inspector: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
      required: true
    },
    quality: {
      type: Number,
      min: 0,
      max: 5
    },
    cert: String
  },
  {
    timestamps: true
  }
)
