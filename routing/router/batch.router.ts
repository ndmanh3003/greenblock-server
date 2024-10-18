import { Router } from 'express'
const router = Router()

import { isBusiness } from '@/middlewares/auth'
import * as schema from '@/routing/schemas/batch.schema'
import validateSchema from '@/middlewares/joi'
import { batchController } from '@/controllers'

router.get('/item', isBusiness, validateSchema(schema.getAllItemsSchema), batchController.getAllItems)

router.put('/item', isBusiness, validateSchema(schema.updateItemSchema), batchController.updateItem)

router.put('/code/:code', isBusiness, validateSchema(schema.updateBatchCodeSchema), batchController.updateBatchCode)

export default router
