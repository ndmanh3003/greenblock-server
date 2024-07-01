const Application = require('express')
const testRouter = require('./test')
const productRouter = require('./product')
const authRouter = require('./auth')
const promotionRouter = require('./promotion')

function router(app: typeof Application) {
  app.use('/test', testRouter)
  app.use('/product', productRouter)
  app.use('/auth', authRouter)
  app.use('/promotion', promotionRouter)
}

module.exports = router
