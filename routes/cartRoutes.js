const express = require('express');
const { addToCart} = require('../controllers/cartController');
const router = express.Router();

// router.get('/:userId', getCart);
router.post('/', addToCart);

module.exports = router;
