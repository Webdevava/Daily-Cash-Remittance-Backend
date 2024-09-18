const express = require('express');
const router = express.Router();
const remittanceController = require('../controllers/remittanceController');
const { authenticate } = require('../middleware/auth');

// router.use(authenticate);

router.get('/', authenticate, (req, res, next) => {
  console.log('Authenticated user:', req.user); // Log the authenticated user
  remittanceController.getRemittances(req, res, next);
});
router.post('/', authenticate, remittanceController.createRemittance);
router.put('/:id', authenticate, remittanceController.updateRemittance);
router.delete('/:id', authenticate, remittanceController.deleteRemittance);
router.get('/export', authenticate, remittanceController.exportRemittances);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Route error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

module.exports = router;