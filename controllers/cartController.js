const Cart = require("../models/Cart");
const Product = require("../models/products");

// =====================================gestion du panier==============================================================
// add to cart 
async function addToCart(req, res, next) {
    try {
        const userId = req.user._id;
        const { productId, quantity } = req.body;   
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (product.stock < quantity) {
            return res.status(400).json({ message: "Insufficient stock" });
        }
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [], total: 0 });
        }
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity, price: product.price });
        }
        cart.total = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
        await cart.save();
        res.status(200).json({ message: "Product added to cart", cart });
    } catch (error) {
        next(error);
    }
}

exports.addToCart = addToCart;