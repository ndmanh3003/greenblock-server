const mongoose = require('mongoose')
const softDelete = require('../../utils/softDelete')
const testSchema = require('./Test')
const authSchema = require('./Auth')
const resourceSchema = require('./Resource')
const promotionschema = require('./Promotion')

//! Apply soft delete to schema
softDelete(testSchema)
softDelete(authSchema)
softDelete(promotionschema)

module.exports = {
  Test: mongoose.model('Test', testSchema),
  Auth: mongoose.model('Auth', authSchema),
  Resource: mongoose.model('Source', resourceSchema),
  Promotion: mongoose.model('Promotion', promotionschema)
}
