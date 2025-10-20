const Orders = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/products");

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

        res.status(201).json({ status: "success", message: "Commande créée avec succès", order });

    } catch (error) {
        console.error("Erreur lors de la création de la commande :", error);
        res.status(500).json({ status: "error", message: "Erreur interne du serveur" });
    }
}

// get orders for a user
async function getOrders(req, res, next) {
    try {
        const userId = req.user?.id || "68ee92632cc5727f5c6d0f01";
        const orders = await Orders.find({ user: userId }).populate("items.product");
        res.status(200).json({ status: "success", orders });
    } catch (error) {
        next(error);
    }
}

// simuler paiement
async function simulatePayment(orderId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 2000);
    });
}

// Gère la route API, appelle simulatePayment, met à jour la commande et renvoie la réponse
async function simulatePaymentController(req, res) {
    const { orderId } = req.body;

    try {
        const order = await Orders.findById(orderId);
        if (!order) {
            return res.status(404).json({ status: "error", message: "Commande introuvable" });
        }

        // Simuler le traitement du paiement
        const paymentSuccess = await simulatePayment(orderId);

        if (paymentSuccess) {
            order.status = "paid"; // 🔹 on met à jour le statut
            order.paymentStatus = "paid";
            await order.save();
            return res.status(200).json({
                status: "success",
                message: "Paiement simulé avec succès",
                order,
            });
        } else {
            return res.status(400).json({ status: "error", message: "Échec du paiement simulé" });
        }
    } catch (error) {
        console.error("Erreur lors de la simulation du paiement :", error);
        res.status(500).json({ status: "error", message: "Erreur interne du serveur" });
    }
}

// mise a jour stock apres commande reussie
async function updateStockAfterOrder(req, res) {
    try {
        const { orderId } = req.body;

        // 1️⃣ Vérifier que l'ID existe
        if (!orderId) {
            return res.status(400).json({ message: "L'ID de la commande est requis." });
        }

        // 2️⃣ Trouver la commande
        const order = await Orders.findById(orderId).populate("items.product");
        if (!order) {
            return res.status(404).json({ message: "Commande introuvable." });
        }

        // 3️⃣ Vérifier que la commande est payée
        if (order.status !== "paid" && order.paymentStatus !== "paid") {
            return res.status(400).json({ message: "Le paiement n'est pas encore confirmé." });
        } 

        // 4️⃣ Parcourir les items et mettre à jour le stock
        for (const item of order.items) {
            const product = item.product;
            if (!product) continue;

            // Vérifier le stock disponible
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Le produit "${product.title}" n'a pas assez de stock.`,
                });
            }

            // Réduire le stock
            product.stock -= item.quantity;
            await product.save();
        }

        return res.status(200).json({
            status: "success",
            message: "Stock mis à jour avec succès après le paiement.",
        });

    } catch (error) {
        console.error("Erreur lors de la mise à jour du stock :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}


module.exports = { createOrder, getOrders, simulatePayment, simulatePaymentController, updateStockAfterOrder };