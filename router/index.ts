const Application = require('express')
const testRouter = require('./test')

function router(app: typeof Application) {
  app.use('/v1/test', testRouter)
}

module.exports = router
