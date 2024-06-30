const Application = require('express')
const testRouter = require('./test')

function router(app: typeof Application) {
  app.use('/test', testRouter)
}

module.exports = router
