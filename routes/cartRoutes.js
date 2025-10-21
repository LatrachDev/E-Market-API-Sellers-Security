const express = require('express');
const { addToCart ,getCart ,updateCartItem,deleteCartItem} = require('../controllers/cartController');
const router = express.Router();
const {cartGate} = require('../middlewares/authorize');

router.post('/',cartGate, addToCart);
router.get('/',cartGate, getCart);
router.put('/:productId',cartGate, updateCartItem);
router.delete('/:productId',cartGate, deleteCartItem);

module.exports = router;
