const express = require('express');
const ngoController = require('../controllers/ngoController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register', ngoController.registerNGO);
router.get('/all', ngoController.getAllNGOs);

router.get('/admin/pending', authenticate, authorize('admin'), ngoController.getPendingNGOs);
router.post('/admin/approve/:id', authenticate, authorize('admin'), ngoController.approveNGO);
router.post('/admin/reject/:id', authenticate, authorize('admin'), ngoController.rejectNGO);
router.get('/admin/statistics', authenticate, authorize('admin'), ngoController.getNGOStatistics);

router.put('/update/:id', authenticate, authorize('ngo', 'admin'), ngoController.updateNGO);
router.get('/:id', ngoController.getNGOById);

module.exports = router;
