const Application = require('express')
const testRouter = require('./test')
const productRouter = require('./product')
const authRouter = require('./auth')

function router(app: typeof Application) {
  app.use('/test', testRouter)
  app.use('/product', productRouter)
  app.use('/auth', authRouter)
}

module.exports = router
