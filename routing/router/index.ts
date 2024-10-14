import { Application } from 'express'
import authRouter from './auth.router'
import batchRouter from './batch.router'
import productRouter from './product.router'

export default function router(app: Application) {
  app.use('/auth', authRouter)
  app.use('/batch', batchRouter)
  app.use('/product', productRouter)
}
