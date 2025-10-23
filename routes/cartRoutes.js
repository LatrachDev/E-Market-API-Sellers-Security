const express = require('express');
const { addToCart ,getCart ,updateCartItem,deleteCartItem} = require('../controllers/cartController');
const router = express.Router();
 const auth=require('../middlewares/auth');

router.post('/', auth.authMiddleware,addToCart);
router.get('/', getCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', deleteCartItem);

module.exports = router;
