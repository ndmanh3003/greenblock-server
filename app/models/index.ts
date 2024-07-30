const mongoose = require('mongoose')
const softDelete = require('../../plugins/softDelete')

const authSchema = require('./Auth')
const productSchema = require('./Product')
const batchSchema = require('./Batch')

//! Apply soft delete to schema
softDelete(authSchema)
softDelete(productSchema)

module.exports = {
  Auth: mongoose.model('Auth', authSchema),
  Product: mongoose.model('Product', productSchema),
  Batch: mongoose.model('Batch', batchSchema)
}
