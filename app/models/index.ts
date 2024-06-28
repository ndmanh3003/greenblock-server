const mongoose = require('mongoose')
const testSchema = require('./Test')

module.exports = {
  Test: mongoose.model('Test', testSchema)
}
