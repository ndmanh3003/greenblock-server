import mongoose, { InferSchemaType, Model } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'
import { authSchema } from './Auth'
import { productSchema } from './Product'
import { batchSchema, varietySchema, landSchema } from './Batch'

mongoose.plugin(MongooseDelete, { deletedAt: true, overrideMethods: 'all' })

export interface IAuth extends Document, InferSchemaType<typeof authSchema>, SoftDeleteDocument {}
export interface IAuthModel extends Model<IAuth>, SoftDeleteModel<IAuth> {}
export const Auth = mongoose.model<IAuth, IAuthModel>('Auth', authSchema)

export interface IProduct extends Document, InferSchemaType<typeof productSchema>, SoftDeleteDocument {}
export interface IProductModel extends Model<IProduct>, SoftDeleteModel<IProduct> {}
export const Product = mongoose.model<IProduct, IProductModel>('Product', productSchema)

export interface IVariety extends Document, InferSchemaType<typeof varietySchema>, SoftDeleteDocument {}
export interface IVarietyModel extends Model<IVariety>, SoftDeleteModel<IVariety> {}
export const Variety = mongoose.model('Variety', varietySchema)

export interface ILand extends Document, InferSchemaType<typeof landSchema>, SoftDeleteDocument {}
export interface ILandModel extends Model<ILand>, SoftDeleteModel<ILand> {}
export const Land = mongoose.model('Land', landSchema)

export interface IBatch extends Document, InferSchemaType<typeof batchSchema>, SoftDeleteDocument {}
export interface IBatchModel extends Model<IBatch>, SoftDeleteModel<IBatch> {}
export interface IBatchPopulated extends Omit<IBatch, 'land' | 'variety'> {
  land: ILand[]
  variety: IVariety[]
}
export const Batch = mongoose.model('Batch', batchSchema)

export * from './Auth'
export * from './Product'
export * from './Batch'
