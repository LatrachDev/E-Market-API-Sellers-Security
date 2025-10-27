const cart = require('../models/Cart');


module.exports = cartGate = (req, res, next) => {
    try {
        const userId = req.user.id;
        const cart = Cart.findById(req.params.id);
        if (!cart) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: "Cart not found"
            });
        }
        if (cart.user.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                code: 403,
                message: "Access denied"
            });
        }
        next();
    } catch (error) {
        next(error);
    }
}
