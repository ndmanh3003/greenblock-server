import { Router } from 'express'
const router = Router()

import { batchController } from '../app/controllers'
import { isBusiness } from '../middleware'

router.get('/:type', isBusiness, batchController.getAllItems)

// body {items: [{name, ?itemId, ?quantity}]}
router.put('/:type', isBusiness, batchController.updateAllItemNames)

router.put('/code/:code', isBusiness, batchController.updateBatchCode)

export default router
