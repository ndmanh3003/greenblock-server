import { Schema, Document } from 'mongoose'

export interface IAuth extends Document {
  name: string
  isVerified?: boolean
  email: string
  password?: string
  isBusiness: boolean
  cert: string
  refreshToken?: string
}

export const authSchema = new Schema<IAuth>(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Email is invalid']
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 30
    },
    cert: {
      type: String,
      required: true
    },
    isBusiness: {
      type: Boolean,
      required: true
    },
    // manage by system
    isVerified: {
      type: Boolean,
      default: false
    },
    refreshToken: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
)
