const express = require('express')
const router = express.Router()
const ViewsController = require('../controllers/reviewController')
const Shema = require('../validators/reviewValidation')
const validate = require('../middlewares/validate')
const { apiLimiter, strictLimiter } = require('../middlewares/rate-limiter')
const { role } = require('../middlewares/role')

const controller = new ViewsController()

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Gestion des avis utilisateurs (reviews)
 */

/**
 * @swagger
 * /product/{productId}/review:
 *   post:
 *     summary: Créer un avis pour un produit
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *               - rating
 *             properties:
 *               comment:
 *                 type: string
 *                 example: "Très bon produit !"
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *     responses:
 *       201:
 *         description: Avis créé avec succès
 *       403:
 *         description: L'utilisateur n'a pas acheté le produit
 *       409:
 *         description: L'utilisateur a déjà laissé un avis
 */
router.post(
  '/:productId/review',
  strictLimiter,
  validate(Shema.createreViewSchema),
  controller.createreView
)

/**
 * @swagger
 * /product/{productId}/review:
 *   get:
 *     summary: Récupérer tous les avis d'un produit
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Liste des avis pour ce produit
 *       404:
 *         description: Aucun avis trouvé pour ce produit
 */
router.get('/:productId/review', apiLimiter, controller.getAllreViews)

/**
 * @swagger
 * /product/{productId}/review/{id}:
 *   put:
 *     summary: Mettre à jour un avis par l'utilisateur
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'avis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 example: "Mis à jour : super produit !"
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *     responses:
 *       200:
 *         description: Avis mis à jour avec succès
 *       403:
 *         description: Pas le droit de modifier l'avis d'un autre utilisateur
 */
router.put('/:productId/review/:id', strictLimiter, controller.updateUsereView)

/**
 * @swagger
 * /product/{productId}/review/{id}:
 *   delete:
 *     summary: Supprimer un avis par l'utilisateur (soft delete)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'avis
 *     responses:
 *       200:
 *         description: Avis supprimé (soft delete)
 *       403:
 *         description: Pas le droit de supprimer l'avis d'un autre utilisateur
 */
router.delete(
  '/:productId/review/:id',
  strictLimiter,
  controller.deleteUsereView
)

/**
 * @swagger
 * /product/review/{id}:
 *   put:
 *     summary: Mettre à jour un avis (Admin)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'avis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 example: "Avis corrigé par admin"
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *     responses:
 *       200:
 *         description: Avis mis à jour par admin
 *       404:
 *         description: Avis non trouvé
 */
router.delete(
  '/review/:id',
  strictLimiter,
  role('admin'),
  controller.deletereViews
)

/**
 * @swagger
 * /product/review/{id}:
 *   delete:
 *     summary: Supprimer un avis (Admin)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'avis
 *     responses:
 *       200:
 *         description: Avis supprimé par admin
 *       404:
 *         description: Avis non trouvé
 */
router.put(
  '/review/:id',
  strictLimiter,
  role('admin'),
  controller.updatereViews
)

module.exports = router
