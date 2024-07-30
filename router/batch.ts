const router = require('express').Router()
const batchController = require('../app/controllers/batchController')
const { isBusiness } = require('../middleware/role')

// body {type: land/variety}
router.get('/:type', isBusiness, batchController.getAllItems)

// body {type: land/variety, item: [{name, ?quanity}]}
router.put('/:type', isBusiness, batchController.updateAllItemNames)

module.exports = router
