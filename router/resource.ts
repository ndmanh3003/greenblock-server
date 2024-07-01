const router = require('express').Router()
const resourceController = require('../app/controllers/resourceController')
const { isBusiness } = require('../middleware/role')

// Update resource
router.put('/:type', isBusiness, resourceController.updateResource)
// Get resource
router.get('/:type', isBusiness, resourceController.getResource)

module.exports = router
