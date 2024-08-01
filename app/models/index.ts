import mongoose from 'mongoose'
import { softDelete } from '../../plugins'

// Schema
import { authSchema, IAuth } from './Auth'
import { productSchema, IProduct } from './Product'
import { batchSchema, IBatch } from './Batch'

// Soft delete
softDelete(authSchema)
softDelete(productSchema)
softDelete(batchSchema)

const Auth = mongoose.model<IAuth>('Auth', authSchema)
const Product = mongoose.model<IProduct>('Product', productSchema)
const Batch = mongoose.model<IBatch>('Batch', batchSchema)

export { Auth, Product, Batch }
export * from './Auth'
export * from './Product'
export * from './Batch'
