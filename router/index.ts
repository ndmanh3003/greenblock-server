const Application = require('express')
const testRouter = require('./test')
const productRouter = require('./product')
const authRouter = require('./auth')
const promotionRouter = require('./promotion')
const resourceRouter = require('./resource')

function router(app: typeof Application) {
  app.use('/test', testRouter)
  app.use('/product', productRouter)
  app.use('/auth', authRouter)
  app.use('/promotion', promotionRouter)
  app.use('/resource', resourceRouter)
}

module.exports = router
