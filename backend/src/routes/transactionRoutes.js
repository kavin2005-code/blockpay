const express = require('express');
const router = express.Router();
const tx = require('../controllers/transactionController');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const protect = async (req, res, next) => {
  try {
    const h = (req.headers['authorization'] || '');
    const parts = h.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const decoded = jwt.verify(parts[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    req.user = user;
    next();
  } catch(e) {
    return res.status(401).json({ success: false, message: e.message });
  }
};

router.get('/history', protect, tx.getHistory);
router.get('/wallet/balance', protect, tx.getWalletBalance);
router.post('/send', protect, tx.sendMoney);
router.post('/wallet/deposit', protect, tx.depositMoney);
router.get('/:txHash/verify', protect, tx.verifyOnBlockchain);

module.exports = router;
