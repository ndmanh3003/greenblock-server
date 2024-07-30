const mongoose = require('mongoose')

export interface IAuth {
  _id: string
  name: string
  code: string | undefined
  email: string
  password: string | undefined
  isBusiness: boolean
  cert: string
  refreshToken: string | null
}

const authSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    isBusiness: {
      type: Boolean,
      required: true
    },
    cert: {
      type: String,
      required: true
    },
    refreshToken: String
  },
  {
    timestamps: true
  }
)

module.exports = authSchema
