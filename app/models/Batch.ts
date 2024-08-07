import { Schema } from 'mongoose'

export const landSchema = new Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 30 },
  product: { type: [Schema.Types.ObjectId], default: [], ref: 'Product' }
})

export const varietySchema = new Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 30 },
  quantity: { type: Number, default: 0, min: 0 },
  product: { type: [Schema.Types.ObjectId], default: [], ref: 'Product' }
})

export const batchSchema = new Schema(
  {
    land: { type: [Schema.Types.ObjectId], default: [], ref: 'Land' },
    variety: { type: [Schema.Types.ObjectId], default: [], ref: 'Variety' },
    business: { type: Schema.Types.ObjectId, ref: 'Business', required: true, unique: true },
    code: { type: String, default: '123' }
  },
  { timestamps: true }
)
