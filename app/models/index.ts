const mongoose = require('mongoose')
const softDelete = require('../../utils/softDelete')
const testSchema = require('./Test')
const authSchema = require('./Auth')
const sourceSchema = require('./Source')
const promotionschema = require('./Promotion')

//! Apply soft delete to schema
softDelete(testSchema)
softDelete(authSchema)
softDelete(sourceSchema)
softDelete(promotionschema)

module.exports = {
  Test: mongoose.model('Test', testSchema),
  Auth: mongoose.model('Auth', authSchema),
  Source: mongoose.model('Source', sourceSchema),
  Promotion: mongoose.model('Promotion', promotionschema)
}
