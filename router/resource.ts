const router = require('express').Router()
const resourceController = require('../app/controllers/resourceController')
const { isBusiness } = require('../middleware/role')

/**
 * @desc    Update a specific resource type
 * @access  Private (business only)
 * @param   type - Resource type index (0: farmers, 1: processors, 2: varieties, 3: lands)
 * @body    { data: any[] } - Array of items to update (will be converted to unique strings)
 * @returns Updated resource data
 */
router.put('/:type', isBusiness, resourceController.updateResource)

/**
 * @desc    Get a specific resource type
 * @access  Private (business only)
 * @param   type - Resource type index (0: farmers, 1: processors, 2: varieties, 3: lands)
 * @returns Array of resource items
 */
router.get('/:type', isBusiness, resourceController.getResource)

module.exports = router
