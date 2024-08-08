import { Router } from 'express'
const router = Router()

import { batchController } from '../app/controllers'
import { isBusiness, validateSchema } from '../middleware'
import * as schema from './batch.schema'

router.get('/:type', isBusiness, validateSchema(schema.getAllItemsSchema), batchController.getAllItems)

// body {items: [{name, ?itemId, ?quantity}]}
router.put('/:type', isBusiness, validateSchema(schema.updateAllItemsSchema), batchController.updateAllItems)

router.put('/code/:code', isBusiness, validateSchema(schema.updateBatchCodeSchema), batchController.updateBatchCode)

export default router
