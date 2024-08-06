import { Application } from 'express'
import authRouter from './auth'
import batchRouter from './batch'
import productRouter from './product'

export function router(app: Application) {
  app.use('/auth', authRouter)
  app.use('/batch', batchRouter)
  app.use('/product', productRouter)
}
