const router = require('express').Router()
const promotionController = require('../app/controllers/promotionController')
const verifyToken = require('../middleware/auth')

// Get deleted promotions
router.get('/deleted', promotionController.getDeleted)
// Create new promotion
router.post('/', verifyToken, promotionController.createPromotion)
// Update promotion
router.put('/', verifyToken, promotionController.updatePromotion)
// Delete promotion by id promotion
router.delete('/:id', verifyToken, promotionController.deletePromotion)
// Get all promotions for id business, of for happenings
router.get('/:id?', promotionController.getAllPromotions)

module.exports = router
