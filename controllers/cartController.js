const Cart = require("../models/Cart");
const Product = require("../models/products");

// =====================================gestion du panier==============================================================
// add to cart 
async function addToCart(req, res) {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user?.id ;
        console.log(req.user);
        console.log("userId:", userId);

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
            //  Le produit existe déjà on augmente la quantité
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Nouveau produit → on l’ajoute
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

// get cart
async function getCart(req, res) {
    try {
     
        const userId = req.user?._id ;

        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart) {
            return res.status(404).json({ message: "Panier introuvable" });
        }
        res.status(200).json({ cart });
    } catch (error) {
        console.error("Erreur lors de la récupération du panier :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// update cart item quantity
async function updateCartItem(req, res) {
    try {
        const { productId } = req.params;
        const userId = req.user?._id;
        
        const { quantity } = req.body;
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Panier introuvable" });
        }
        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Produit introuvable dans le panier" });
        }
        cart.items[itemIndex].quantity = quantity;
        cart.total = cart.items.reduce(
            (acc, item) => acc + item.quantity * item.price,
            0
        );
        await cart.save();
        res.status(200).json({
            message: "Quantité mise à jour avec succès",
            cart,
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du panier :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// delete cart item
async function deleteCartItem(req, res) {
    try {
        const { productId } = req.params;
        const userId = req.user?._id ;
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Panier introuvable" });
        }
        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Produit introuvable dans le panier" });
        }
        cart.items.splice(itemIndex, 1);
        cart.total = cart.items.reduce(
            (acc, item) => acc + item.quantity * item.price,
            0
        );
        await cart.save();
        res.status(200).json({
            message: "Produit supprimé du panier avec succès",
            cart,
        });
    } catch (error) {
        console.error("Erreur lors de la suppression du produit du panier :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

module.exports = { addToCart, getCart, updateCartItem, deleteCartItem };

