import { Schema } from 'mongoose'

export enum ItemType {
  variety = 'variety',
  land = 'land'
}

export const itemSchema = new Schema({
  type: { type: String, required: true, enum: Object.values(ItemType) },
  name: { type: String, required: true, minlength: 3, maxlength: 30 },
  businessId: { type: Schema.Types.ObjectId, ref: 'Auth', required: true }
})

export const batchSchema = new Schema({
  code: { type: String, default: '12345', minlength: 5, maxlength: 30 }
})
