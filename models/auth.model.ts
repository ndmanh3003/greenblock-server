import { Schema } from 'mongoose'

export const authSchema = new Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, match: [/^\S+@\S+\.\S+$/, 'Email is invalid'] },
  password: { type: String, required: true, minlength: 6, maxlength: 128 },
  cert: { type: String, required: true },
  isBusiness: { type: Boolean, required: true },

  isVerified: { type: Boolean, default: false },
  refreshToken: String
})
