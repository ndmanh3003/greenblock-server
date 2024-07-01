const router = require('express').Router()
const promotionController = require('../app/controllers/promotionController')
const { isBusiness } = require('../middleware/role')

// Get deleted promotions
router.get('/deleted', promotionController.getDeleted)
// Create new promotion
router.post('/', isBusiness, promotionController.createPromotion)
// Update promotion
router.put('/', isBusiness, promotionController.updatePromotion)
// Delete promotion by id promotion
router.delete('/:id', isBusiness, promotionController.deletePromotion)
// Get all promotions for id business, of for happenings
router.get('/:id?', promotionController.getAllPromotions)

module.exports = router
