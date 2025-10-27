const express = require("express");
const { createOrder ,getOrders ,simulatePaymentController  ,updateStockAfterOrder,updateOrderStatus} = require("../controllers/orderController");
const router = express.Router();
const authenticateUser  = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const {apiLimiter,strictLimiter}=require('../middlewares/rate-limiter');



/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Créer une nouvelle commande
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
 *               cartId:
 *                 type: string
 *                 description: ID du panier à convertir en commande
 *               paymentMethod:
 *                 type: string
 *                 description: "Méthode de paiement (ex: carte, espèce, etc.)"
 *             example:
 *               cartId: "66f3e41c51a2a8e0d4f3a9b7"
 *               paymentMethod: "carte"
 *     responses:
 *       201:
 *         description: Commande créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 message: "Commande créée avec succès"
 *                 order:
 *                   id: "672a15c123456789abcd9999"
 *                   totalAmount: 2499
 *                   status: "en attente"
 *       400:
 *         description: Erreur lors de la création de la commande
 */
router.post("/", strictLimiter,authenticateUser.authMiddleware, createOrder);

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
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID de la commande
 *                   totalAmount:
 *                     type: number
 *                     description: Montant total
 *                   status:
 *                     type: string
 *                     description: Statut de la commande
 *                 example:
 *                   - id: "672a15c123456789abcd9999"
 *                     totalAmount: 2499
 *                     status: "payée"
 *                   - id: "672a15c987654321abcd8888"
 *                     totalAmount: 1399
 *                     status: "en attente"
 *       404:
 *         description: Aucune commande trouvée
 */
router.get("/",apiLimiter,authenticateUser.authMiddleware, getOrders);

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
 *             example:
 *               orderId: "672a15c123456789abcd9999"
 *     responses:
 *       200:
 *         description: Paiement simulé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 message: "Paiement réussi"
 *                 order:
 *                   id: "672a15c123456789abcd9999"
 *                   status: "payée"
 *       404:
 *         description: Commande introuvable
 */
router.post("/simulate-payment",strictLimiter,authenticateUser.authMiddleware, simulatePaymentController);

/**
 * @swagger
 * /api/orders:
 *   put:
 *     summary: Mettre à jour le stock des produits après une commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 message: "Stock mis à jour après commande"
 *       400:
 *         description: Erreur lors de la mise à jour du stock
 */
router.put("/", strictLimiter,authenticateUser.authMiddleware, updateStockAfterOrder);
router.put("/:orderId/status",strictLimiter,authenticateUser.authMiddleware,isAdmin, updateOrderStatus);

module.exports = router;
