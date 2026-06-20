const express = require('express');
const campaignController = require('../controllers/campaignController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/create', authenticate, authorize('ngo', 'admin'), campaignController.createCampaign);
router.get('/all', campaignController.getAllCampaigns);
router.get('/ngo/:ngoId', campaignController.getCampaignsByNGO);
router.put('/update/:id', authenticate, authorize('ngo', 'admin'), campaignController.updateCampaign);
router.delete('/delete/:id', authenticate, authorize('ngo', 'admin'), campaignController.deleteCampaign);
router.get('/:id', campaignController.getCampaignById);

module.exports = router;
