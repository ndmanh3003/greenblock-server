const router = require('express').Router()
const testController = require('../app/controllers/testController')

// Add test
router.post('/', testController.addTest)
// Get all tests
router.get('/', testController.getTests)
// Get test by id
router.get('/:id', testController.getTestById)
// Update test
router.put('/:id', testController.updateTest)
// Delete test
router.delete('/:id', testController.deleteTest)

module.exports = router
