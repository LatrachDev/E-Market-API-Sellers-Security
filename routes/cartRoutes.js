const express = require('express');
const { addToCart, getCart, updateCartItem, deleteCartItem } = require('../controllers/cartController');
const router = express.Router();
const cartGate = require('../middlewares/authorize');



/**
 * @swagger
 * tags:
 *   name: Panier
 *   description: Gestion du panier d'achat
 */

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Ajouter un produit au panier
 *     tags: [Panier]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID du produit à ajouter
 *               quantity:
 *                 type: integer
 *                 description: Quantité du produit
 *             example:
 *               productId: "66f3e41c51a2a8e0d4f3a9b7"
 *               quantity: 2
 *     responses:
 *       200:
 *         description: Produit ajouté au panier avec succès
 *       400:
 *         description: Erreur lors de l'ajout au panier
 */
router.post('/',apiLimiter, cartGate, addToCart);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Récupérer le panier de l'utilisateur connecté
 *     tags: [Panier]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Panier récupéré avec succès
 *       404:
 *         description: Panier introuvable
 */
router.get('/',apiLimiter,getCart);

/**
 * @swagger
 * /api/cart/{productId}:
 *   put:
 *     summary: Mettre à jour la quantité d'un produit dans le panier
 *     tags: [Panier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: ID du produit à modifier
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: Nouvelle quantité du produit
 *             example:
 *               quantity: 3
 *     responses:
 *       200:
 *         description: Quantité mise à jour avec succès
 *       404:
 *         description: Produit non trouvé dans le panier
 */
router.put('/:productId',apiLimiter, cartGate, updateCartItem);

/**
 * @swagger
 * /api/cart/{productId}:
 *   delete:
 *     summary: Supprimer un produit du panier
 *     tags: [Panier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: ID du produit à supprimer du panier
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produit supprimé du panier avec succès
 *       404:
 *         description: Produit non trouvé dans le panier
 */
router.delete('/:productId',apiLimiter, cartGate, deleteCartItem);

module.exports = router;
