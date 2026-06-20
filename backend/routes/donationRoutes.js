const express = require('express');
const donationController = require('../controllers/donationController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, authorize('donor'), donationController.createDonation);
router.get('/mine', authenticate, authorize('donor'), donationController.getMyDonations);
router.get('/campaign/:campaignId', authenticate, authorize('ngo', 'admin'), donationController.getCampaignDonations);

module.exports = router;
