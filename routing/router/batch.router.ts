import { Router } from 'express'
const router = Router()

import { batchController } from '@/controllers/batch.controller'
import { isBusiness } from '@/middlewares/auth'
import * as schema from '@/routing/schemas/batch.schema'
import validateSchema from '@/middlewares/joi'

router.get('/:type', isBusiness, validateSchema(schema.getAllItemsSchema), batchController.getAllItems)
router.put('/', isBusiness, validateSchema(schema.updateAllItemsSchema), batchController.updateAllItems)
router.put('/code/:code', isBusiness, validateSchema(schema.updateBatchCodeSchema), batchController.updateBatchCode)

export default router
