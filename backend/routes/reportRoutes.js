const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, authorize('ngo', 'admin'), reportController.uploadReport);
router.get('/:id/download', authenticate, authorize('ngo', 'admin'), reportController.downloadReport);
router.get('/campaign/:campaignId', reportController.getReportsByCampaign);

module.exports = router;
