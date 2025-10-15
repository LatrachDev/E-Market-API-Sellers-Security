const Cart = require("../models/Cart");
const Product = require("../models/products");

// =====================================gestion du panier==============================================================
// add to cart 
async function addToCart(req, res) {
  try {
    // 🔹 Récupérer userId depuis le body au lieu de req.user
    const {  productId, quantity } = req.body;
    const userId = req.user?.id || "68ee92632cc5727f5c6d0f01";

    // Vérifier que userId est bien fourni
    if (!userId) {
      return res.status(400).json({ message: "L'ID utilisateur est requis" });
    }

    // Vérifier que le produit existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    // Vérifier le stock disponible
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Stock insuffisant" });
    }

    // Rechercher le panier de l'utilisateur
    let cart = await Cart.findOne({ user: userId });

    // Si le panier n'existe pas, on le crée
    if (!cart) {
      cart = new Cart({ user: userId, items: [], total: 0 });
    }

    // Chercher si le produit est déjà dans le panier
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // 🔁 Le produit existe déjà → on augmente la quantité
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // 🆕 Nouveau produit → on l’ajoute
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }

    // Recalculer le total du panier
    cart.total = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );

    // Sauvegarder le panier
    await cart.save();

    res.status(200).json({
      message: "Produit ajouté au panier avec succès",
      cart,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout au panier :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
}

module.exports = { addToCart };

