import mongoose, { InferSchemaType, Model } from 'mongoose'
import { authSchema } from './Auth'
import { productSchema, IProduct } from './Product'
import { batchSchema, IBatch } from './Batch'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

mongoose.plugin(MongooseDelete, { deletedAt: true, overrideMethods: 'all' })

export interface IAuth extends Document, InferSchemaType<typeof authSchema>, SoftDeleteDocument {}
export interface IAuthModel extends Model<IAuth>, SoftDeleteModel<IAuth> {}
export const Auth = mongoose.model<IAuth, IAuthModel>('Auth', authSchema)

export const Product = mongoose.model<IProduct>('Product', productSchema)
export const Batch = mongoose.model<IBatch>('Batch', batchSchema)

export * from './Auth'
export * from './Product'
export * from './Batch'
