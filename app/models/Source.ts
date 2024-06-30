const mongoose = require('mongoose')

const sourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = sourceSchema
