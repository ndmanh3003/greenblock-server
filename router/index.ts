const Application = require('express')
const authRouter = require('./auth')
const batchRouter = require('./batch')
const productRouter = require('./product')

function router(app: typeof Application) {
  app.use('/auth', authRouter)
  app.use('/batch', batchRouter)
  app.use('/product', productRouter)
}

module.exports = router
