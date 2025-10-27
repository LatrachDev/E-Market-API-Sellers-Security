const Products = require("../models/products");

const checkProductOwnership = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id; 
    
    // find the product
    const product = await Products.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if the user is the seller of this product
    // Convert ObjectId to string for comparison
    if (product.seller.toString() !== userId) {
      return res.status(403).json({ 
        message: 'Access denied. You can only edit your own products' 
      });
    }
    
    // If ownership check passes, continue to the next middleware/controller
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { checkProductOwnership };