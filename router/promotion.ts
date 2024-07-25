const router = require('express').Router()
const promotionController = require('../app/controllers/promotionController')
const { isBusiness } = require('../middleware/role')

/**
 * @desc    Get all promotions for a business or current happenings
 * @access  Public
 * @param   id? - Optional. Business ID to fetch promotions for
 * @returns Array of promotion objects or current promotions
 */
router.get('/:id?', promotionController.getAllPromotions)

/**
 * @desc    Create a new promotion
 * @access  Private (Business only)
 * @header  Authorization - Bearer token
 * @body    { startDate: Date, endDate: Date, [other promotion fields]: Any }
 * @returns Created promotion object
 */
router.post('/', isBusiness, promotionController.createPromotion)

/**
 * @desc    Update an existing promotion
 * @access  Private (Business only)
 * @header  Authorization - Bearer token
 * @body    { id: string, [fields to update]: Any }
 * @returns Updated promotion object
 */
router.put('/', isBusiness, promotionController.updatePromotion)

/**
 * @desc    Delete a promotion
 * @access  Private (Business only)
 * @header  Authorization - Bearer token
 * @param   id - Promotion ID to delete
 * @returns Success message
 */
router.delete('/:id', isBusiness, promotionController.deletePromotion)

module.exports = router
