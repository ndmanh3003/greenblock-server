import softDelete from '../../utils/softDelete'

const mongoose = require('mongoose')

const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

softDelete(testSchema)
module.exports = testSchema
