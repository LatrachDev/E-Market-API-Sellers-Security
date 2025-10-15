const express = require('express');
const { addToCart ,getCart ,updateCartItem} = require('../controllers/cartController');
const router = express.Router();

router.post('/', addToCart);
router.get('/', getCart);
router.put('/:productId', updateCartItem);

module.exports = router;
