import { Types, Schema, Document, Query } from 'mongoose'
import { NextFunction } from 'express'
import { Batch } from '.'

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

export interface IProduct extends Document {
  name: string
  record: number
  desc: string
  quality: number
  cert: string
  variety: string
  land: string
  exportAt: Date
  current: string
  business: Types.ObjectId
  inspector: Types.ObjectId
  quantityIn: number
  quantityOut: number
}

export const productSchema = new Schema<IProduct>(
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

const updateMiddleware = async function (this: Query<IProduct, IProduct>, next: NextFunction) {
  const update = this.getUpdate() as IProduct
  const document = await this.model.findOne(this.getQuery())

  if (roleCurrent.business.includes(update.current) && !document.exportAt) update.exportAt = new Date()

  if (update.current != allCurrent.PLANTING) {
    if (!document.quantityOut && !update.quantityOut) throw new Error('Quantity out is required')

    // update batch
    const batch = await Batch.findOne({ business: document.business })
    const landBatch = batch.land.find((land) => land._id == document.land)
    landBatch.product = landBatch.product.filter((id) => id.equals(document._id))

    await batch.save()
  }
  next()
}

productSchema.pre<Query<IProduct, IProduct>>('findOneAndUpdate', updateMiddleware)
productSchema.pre<Query<IProduct, IProduct>>('save', updateMiddleware)
productSchema.pre<Query<IProduct, IProduct>>('findOneAndDelete', updateMiddleware)
