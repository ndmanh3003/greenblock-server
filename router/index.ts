const Application = require('express')
const testRouter = require('./test')
const productRouter = require('./product')

function router(app: typeof Application) {
  app.use('/test', testRouter)
  app.use('/product', productRouter)
}

module.exports = router
