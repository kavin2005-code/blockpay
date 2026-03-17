const express = require('express');
const router = express.Router();
const bills = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/providers/:billType', bills.getProviders);
router.post('/validate', bills.validateBill);
router.post('/pay', bills.payBill);
router.post('/recharge', bills.mobileRecharge);

module.exports = router;
