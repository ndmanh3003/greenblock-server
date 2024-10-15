import { Types } from 'mongoose'

/* eslint-disable @typescript-eslint/naming-convention */
declare global {
  namespace Express {
    interface Request {
      userId: Types.ObjectId
      isBusiness: boolean
    }
  }
}
