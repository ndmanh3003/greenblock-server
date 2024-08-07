import mongoose, { InferSchemaType } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'
import { authSchema } from './Auth'
import { productSchema } from './Product'
import { batchSchema, itemSchema } from './Batch'

mongoose.plugin(MongooseDelete, { deletedAt: true, overrideMethods: 'all' })

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

export * from './Auth'
export * from './Product'
export * from './Batch'
