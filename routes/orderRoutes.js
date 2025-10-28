const express = require("express");
const { createOrder, getOrders, simulatePaymentController, updateStockAfterOrder, updateOrderStatus } = require("../controllers/orderController");
const router = express.Router();
const { apiLimiter, strictLimiter } = require('../middlewares/rate-limiter');
const { role } = require("../middlewares/role");


/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Créer une nouvelle commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               couponCode:
 *                 type: string
 *                 description: Code promo à appliquer (optionnel)
 *           example:
 *             couponCode: "WELCOME10"
 *     responses:
 *       201:
 *         description: Commande créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 order:
 *                   type: object
 *               example:
 *                 status: "success"
 *                 message: "Commande créée avec succès"
 *                 order:
 *                   _id: "672a15c123456789abcd9999"
 *                   total: 2499
 *                   status: "pending"
 *       400:
 *         description: Panier vide ou coupon invalide/expiré
 *       404:
 *         description: Coupon introuvable
 *       500:
 *         description: Erreur serveur
 */
router.post("/", strictLimiter, createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Récupérer toutes les commandes de l'utilisateur connecté
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des commandes récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Erreur serveur
 */
router.get("/", apiLimiter, getOrders);

/**
 * @swagger
 * /api/orders/simulate-payment:
 *   post:
 *     summary: Simuler un paiement pour une commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: ID de la commande à payer
 *           example:
 *             orderId: "672a15c123456789abcd9999"
 *     responses:
 *       200:
 *         description: Paiement simulé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 order:
 *                   type: object
 *               example:
 *                 status: "success"
 *                 message: "Paiement simulé avec succès"
 *                 order:
 *                   _id: "672a15c123456789abcd9999"
 *                   paymentStatus: "paid"
 *       400:
 *         description: Échec du paiement simulé
 *       404:
 *         description: Commande introuvable
 *       500:
 *         description: Erreur serveur
 */
router.post("/simulate-payment", strictLimiter, simulatePaymentController);

/**
 * @swagger
 * /api/orders:
 *   put:
 *     summary: Mettre à jour le stock des produits après une commande payée
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: ID de la commande payée
 *           example:
 *             orderId: "672a15c123456789abcd9999"
 *     responses:
 *       200:
 *         description: Stock mis à jour avec succès après le paiement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: "success"
 *                 message: "Stock mis à jour avec succès après le paiement."
 *       400:
 *         description: Paiement non confirmé ou stock insuffisant
 *       404:
 *         description: Commande introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put("/", strictLimiter, updateStockAfterOrder);

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   put:
 *     summary: Mettre à jour le statut d'une commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: ID de la commande à mettre à jour
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newStatus]
 *             properties:
 *               newStatus:
 *                 type: string
 *                 enum: [pending, paid, shipped, delivered, cancelled]
 *                 description: Nouveau statut de la commande
 *           example:
 *             newStatus: "shipped"
 *     responses:
 *       200:
 *         description: Statut de la commande mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: "success"
 *                 message: "Statut de la commande mis à jour en \"shipped\"."
 *                 order:
 *                   _id: "672a15c123456789abcd9999"
 *                   status: "shipped"
 *       400:
 *         description: Statut invalide ou données manquantes
 *       404:
 *         description: Commande introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put("/:orderId/status", strictLimiter, role("admin"), updateOrderStatus);

module.exports = router;
