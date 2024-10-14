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

export interface IAuth extends InferSchemaType<typeof authSchema>, SoftDeleteDocument {}
export const Auth = mongoose.model<IAuth, SoftDeleteModel<IAuth>>('Auth', authSchema)

export interface IProduct extends InferSchemaType<typeof productSchema>, SoftDeleteDocument {}
export const Product = mongoose.model<IProduct, SoftDeleteModel<IProduct>>('Product', productSchema)

export interface IItem extends InferSchemaType<typeof itemSchema>, SoftDeleteDocument {}
export const Item = mongoose.model<IItem, SoftDeleteModel<IItem>>('Item', itemSchema)

export interface IBatch extends InferSchemaType<typeof batchSchema>, SoftDeleteDocument {}
export const Batch = mongoose.model<IBatch, SoftDeleteModel<IBatch>>('Batch', batchSchema)
export interface IBatchPopulated extends Omit<IBatch, 'land' | 'variety'> {
  land: IItem[]
  variety: IItem[]
}

export * from './auth.model'
export * from './product.model'
export * from './batch.model'
