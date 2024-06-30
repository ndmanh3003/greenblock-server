const mongoose = require('mongoose')

export interface IAuth {
  _id: string
  name: string
  email: string
  password: string | undefined
  isBusiness: boolean
  isVerified: boolean
  cert: string
  farmers: string[] | null
  processors: string[] | null
  source: string[] | null
  refreshToken: string | null
}

const authSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
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
    isVerified: {
      type: Boolean,
      required: true,
      default: false
    },
    cert: {
      type: String,
      required: true
    },
    farmers: [String],
    processors: [String],
    source: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Source'
      }
    ],
    refreshToken: String
  },
  {
    timestamps: true
  }
)

module.exports = authSchema
