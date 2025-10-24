const express = require("express");
const { createOrder ,getOrders ,simulatePaymentController  ,updateStockAfterOrder,updateOrderStatus} = require("../controllers/orderController");
const router = express.Router();
const auth=require('../middlewares/auth');
const isAdmin=require('../middlewares/isAdmin');


router.post("/",auth.authMiddleware, createOrder);
router.get("/", auth.authMiddleware, getOrders);

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
router.post("/simulate-payment", simulatePaymentController);

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
router.put("/", updateStockAfterOrder);
router.put("/:orderId/status",auth.authMiddleware,isAdmin, updateOrderStatus);

module.exports = router;
