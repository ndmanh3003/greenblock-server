import { Schema } from 'mongoose'

export enum CurrentType {
  planting = 'planting',
  harvested = 'harvested',
  inspecting = 'inspecting',
  inspected = 'inspected',
  exported = 'exported',
  sold = 'sold'
}

export const roleCurrent = {
  farmer: [CurrentType.planting, CurrentType.harvested],
  inspector: [CurrentType.inspecting, CurrentType.inspected],
  customer: [CurrentType.exported, CurrentType.sold]
}

export const productSchema = new Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  recordId: { type: Number, required: true },
  desc: String,
  current: { type: String, default: CurrentType.planting, enum: CurrentType },
  exportedAt: Date,

  // batch
  businessId: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
  varietyId: { type: String, required: true },
  landId: { type: String, required: true },

  // inspector
  inspectorId: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
  quality: { type: Number, min: 0, max: 5 },
  cert: String
})
