import { Router } from 'express'
const router = Router()

import { batchController } from '@/controllers/batch.controller'
import { isBusiness } from '@/middlewares/auth'
import * as schema from '@/routing/schemas/batch.schema'
import validateSchema from '@/middlewares/joi'

router.get('/item', isBusiness, validateSchema(schema.getAllItemsSchema), batchController.getAllItems)

router.put('/item', isBusiness, validateSchema(schema.updateItemSchema), batchController.updateItem)

router.get('/code', isBusiness, batchController.getBatchCode)

router.put('/code', isBusiness, validateSchema(schema.updateBatchCodeSchema), batchController.updateBatchCode)

export default router
