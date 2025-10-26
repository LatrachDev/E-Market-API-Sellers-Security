const Orders = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/products");
const Coupon = require("../models/Coupon");
const NotificationEmitter = require('../events/notificationEmitter');

// ==============================================gestion des commandes==================================================

// create a new order  
async function createOrder(req, res, next) {
    try {
        const userId = req.user?.id;
        const { couponCode } = req.body;

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

        //  Filtrer les produits valides
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

        let total = cart.total;
        let appliedCoupon = null;
        let discount = 0;

        // Si un code promo est fourni
        if (couponCode) {
            const coupon = await Coupon.findOne({
                code: couponCode.toUpperCase(),
                isDeleted: false
            });

            if (!coupon) {
                return res.status(404).json({ message: "Coupon introuvable" });
            }

            // Vérifier la date d'expiration
            if (new Date(coupon.expirationDate) < new Date()) {
                return res.status(400).json({ message: "Ce coupon est expiré" });
            }

            // Vérifier le nombre d’utilisations restantes
            if (coupon.usesLeft <= 0) {
                return res.status(400).json({ message: "Ce coupon a atteint sa limite d'utilisation" });
            }

            // Vérifier si le coupon est lié à un produit spécifique
            if (coupon.product_id) {
                const productExistsInCart = orderItems.some(item =>
                    item.product.toString() === coupon.product_id.toString()
                );

                if (!productExistsInCart) {
                    return res.status(400).json({
                        message: "Ce coupon ne s'applique pas aux produits de votre panier"
                    });
                }
            }

            // Calcul de la réduction
            if (coupon.type === "percentage") {
                discount = (total * coupon.discount) / 100;
            } else if (coupon.type === "fixed") {
                discount = coupon.discount;
            }

            total = Math.max(total - discount, 0);
            appliedCoupon = coupon;
        }

        //  Créer la commande
        const order = new Orders({
            user: userId,
            items: orderItems,
            total,
            discountApplied: discount,
            coupon: appliedCoupon ? appliedCoupon._id : null
        });

        await order.save();

        // 🧾 Mettre à jour le coupon (s’il a été utilisé)
        if (appliedCoupon) {
            appliedCoupon.usesLeft -= 1;
            await appliedCoupon.save();
        }
        if (process.env.NODE_ENV !== "test") {
            NotificationEmitter.emit('ORDER_PASS', {
                recipient: userId,
                orderId: order._id,
            });
        }




        //  Vider le panier
        cart.items = [];
        cart.total = 0;
        await cart.save();

        res.status(201).json({
            status: "success",
            message: "Commande créée avec succès",
            order
        });

    } catch (error) {
        console.error("Erreur lors de la création de la commande :", error);
        res.status(500).json({
            status: "error",
            message: error.message || "Erreur interne du serveur"
        });
    }
}


// get orders for a user
async function getOrders(req, res, next) {
    try {
        const userId = req.user?.id;
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
            order.status = "paid"; //  on met à jour le statut
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

        //  Vérifier que l'ID existe
        if (!orderId) {
            return res.status(400).json({ message: "L'ID de la commande est requis." });
        }

        //  Trouver la commande
        const order = await Orders.findById(orderId).populate("items.product");
        if (!order) {
            return res.status(404).json({ message: "Commande introuvable." });
        }

        //  Vérifier que la commande est payée
        if (order.status !== "paid" && order.paymentStatus !== "paid") {
            return res.status(400).json({ message: "Le paiement n'est pas encore confirmé." });
        }

        // Parcourir les items et mettre à jour le stock
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
async function updateOrderStatus(req, res) {
    try {
        const { orderId } = req.params;
        const { newStatus } = req.body;
        const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

        if (!orderId || !newStatus) {
            return res.status(400).json({ message: "ID de commande et nouveau statut requis." });
        }

        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({ message: "Statut invalide." });
        }

        const order = await Orders.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Commande introuvable." });
        }

        order.status = newStatus;
        await order.save();

        if (process.env.NODE_ENV !== "test") {
            NotificationEmitter.emit('ORDER_UPDATED', {
                recipient: order.user,
                orderId: order._id,
                newStatus,
            });

        }

        res.status(200).json({
            status: "success",
            message: `Statut de la commande mis à jour en "${newStatus}".`,
            order,
        });

    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}


module.exports = { createOrder, getOrders, simulatePayment, simulatePaymentController, updateStockAfterOrder, updateOrderStatus };