const router = require('express').Router()
const testController = require('../app/controllers/testController')

// ADD TEST
router.post('/', testController.addTest)

module.exports = router
