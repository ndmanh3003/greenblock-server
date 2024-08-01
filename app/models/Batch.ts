import { Types, Schema, Document } from 'mongoose'

export interface ILand extends Document {
  name: string
  product: Types.ObjectId[]
  isDeleted: boolean
}

export interface IVariety extends Document {
  name: string
  quantity: number
  product: Types.ObjectId[]
  isDeleted: boolean
}

export interface IBatch extends Document {
  land: ILand[]
  variety: IVariety[]
  business: Types.ObjectId
  code: string
}

const landSchema = new Schema<ILand>({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30
  },
  product: {
    type: [Schema.Types.ObjectId],
    default: [],
    ref: 'Product'
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
})

const varietySchema = new Schema<IVariety>({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  product: {
    type: [Schema.Types.ObjectId],
    default: [],
    ref: 'Product'
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
})

export const batchSchema = new Schema<IBatch>({
  land: {
    type: [landSchema],
    default: []
  },
  variety: {
    type: [varietySchema],
    default: []
  },
  business: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    unique: true
  },
  code: {
    type: String,
    default: '123'
  }
})
