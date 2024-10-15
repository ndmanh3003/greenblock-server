import mongoose, { InferSchemaType, Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'
import { authSchema } from './auth.model'
import { productSchema } from './product.model'
import { batchSchema, itemSchema } from './batch.model'

const addTimestampsPlugin = (schema: Schema) => {
  schema.set('timestamps', true)
}

mongoose.plugin(MongooseDelete, { deletedAt: true, overrideMethods: 'all' })
mongoose.plugin(addTimestampsPlugin)

function createModel<T extends Schema>(
  name: string,
  schema: T
): SoftDeleteModel<InferSchemaType<T> & SoftDeleteDocument> {
  type ModelType = InferSchemaType<T> & SoftDeleteDocument
  return mongoose.model<ModelType, SoftDeleteModel<ModelType>>(name, schema)
}

export interface IAuth extends InferSchemaType<typeof authSchema>, SoftDeleteDocument {}
export const Auth = createModel('Auth', authSchema)

export interface IItem extends InferSchemaType<typeof itemSchema>, SoftDeleteDocument {}
export const Item = createModel('Item', itemSchema)

export interface IBatch extends InferSchemaType<typeof batchSchema>, SoftDeleteDocument {}
export const Batch = createModel('Batch', batchSchema)

export interface IProduct extends InferSchemaType<typeof productSchema>, SoftDeleteDocument {}
export const Product = createModel('Product', productSchema)
