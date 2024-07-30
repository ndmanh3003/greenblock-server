const mongooseDelete = require('mongoose-delete')
const mongoose = require('mongoose')

function softDelete(schema: typeof mongoose.Schema) {
  schema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' })
}

module.exports = softDelete
