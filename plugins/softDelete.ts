import mongooseDelete from 'mongoose-delete'
import { Schema } from 'mongoose'

export const softDelete = async (schema: Schema) => {
  schema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' })
}
