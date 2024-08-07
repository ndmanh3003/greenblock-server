import { Schema } from 'mongoose'

const validType = ['variety', 'land']

export const itemSchema = new Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 30 },
  product: { type: [Schema.Types.ObjectId], default: [], ref: 'Product' },
  type: { type: String, required: true, enum: [...validType] },
  metadata: { type: Object, default: {} }
})

export const batchSchema = new Schema(
  {
    land: { type: [Schema.Types.ObjectId], default: [], ref: 'Item' },
    variety: { type: [Schema.Types.ObjectId], default: [], ref: 'Item' },
    business: { type: Schema.Types.ObjectId, ref: 'Business', required: true, unique: true },
    code: { type: String, default: '123' }
  },
  { timestamps: true }
)

itemSchema.pre('save', function (next) {
  if (this.type === 'variety' && (!this.metadata || !this.metadata.quantity))
    return next(new Error('Quantity is required for variety'))
  next()
})
