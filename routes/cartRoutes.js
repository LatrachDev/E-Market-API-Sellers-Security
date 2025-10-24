const express = require('express');
const { addToCart, getCart, updateCartItem, deleteCartItem } = require('../controllers/cartController');
const router = express.Router();
 const auth=require('../middlewares/auth');

router.post('/',auth.authMiddleware,addToCart);
router.get('/',getCart);

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
router.put('/:productId', updateCartItem);

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
router.delete('/:productId', deleteCartItem);

module.exports = router;
