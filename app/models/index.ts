import mongoose, { InferSchemaType, Model } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'
import { authSchema } from './Auth'
import { productSchema } from './Product'
import { batchSchema, IBatch } from './Batch'

mongoose.plugin(MongooseDelete, { deletedAt: true, overrideMethods: 'all' })

export interface IAuth extends Document, InferSchemaType<typeof authSchema>, SoftDeleteDocument {}
export interface IAuthModel extends Model<IAuth>, SoftDeleteModel<IAuth> {}
export const Auth = mongoose.model<IAuth, IAuthModel>('Auth', authSchema)

export interface IProduct extends Document, InferSchemaType<typeof productSchema>, SoftDeleteDocument {}
export interface IProductModel extends Model<IProduct>, SoftDeleteModel<IProduct> {}
export const Product = mongoose.model<IProduct, IProductModel>('Product', productSchema)

export const Batch = mongoose.model<IBatch>('Batch', batchSchema)

export * from './Auth'
export * from './Product'
export * from './Batch'
