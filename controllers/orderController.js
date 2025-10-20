const Orders = require("../models/Order");
const Cart = require("../models/Cart");

// ==============================================gestion des commandes==================================================

// create a new order  
async function createOrder(req, res, next) {
  try {
    const userId = req.user?.id || "68ee92632cc5727f5c6d0f01";

    if (!userId) {
      return res.status(400).json({ message: "L'ID utilisateur est requis" });
    }

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        select: "seller title price",
      });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Le panier est vide" });
    }

    // filtrer les produits invalides
    const orderItems = cart.items
      .filter(item => item.product)
      .map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price,
        seller: item.product.seller,
      }));

    if (orderItems.length === 0) {
      return res.status(400).json({ message: "Certains produits du panier n'existent plus." });
    }

    const order = new Orders({
      user: userId,
      items: orderItems,
      total: cart.total,
    });

    await order.save();

    cart.items = [];
    cart.total = 0;
    await cart.save();

    res.status(201).json({status: "success", message: "Commande créée avec succès", order });

  } catch (error) {
    console.error("Erreur lors de la création de la commande :", error);
    res.status(500).json({ status: "error", message: "Erreur interne du serveur" });
  }
}

async function getOrders(req, res, next) {
  try {
    const userId = req.user?.id || "68ee92632cc5727f5c6d0f01";
    const orders = await Orders.find({ user: userId }).populate("items.product");
    res.status(200).json({ status: "success", orders });
  } catch (error) {
    next(error);
  }
}

module.exports = { createOrder, getOrders };