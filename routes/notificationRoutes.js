// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const controller = new NotificationController();
const auth = require('../middlewares/auth');


/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Récupérer toutes les notifications de l'utilisateur connecté
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Non authentifié
 */

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la notification à marquer comme lue
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Notification non trouvée
 */

/**
 * @swagger
 * /notifications/read/all:
 *   patch:
 *     summary: Marquer toutes les notifications de l'utilisateur comme lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Toutes les notifications ont été marquées comme lues
 *       401:
 *         description: Non authentifié
 */

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Supprimer une notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la notification à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification supprimée avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Notification non trouvée
 */

router.get('/',auth.authMiddleware, controller.getNotifications);

router.patch('/:id/read', auth.authMiddleware,controller.markAsRead);
router.patch('/read/all', auth.authMiddleware, controller.markAllAsRead);

router.delete('/:id', auth.authMiddleware, controller.deleteNotification);



module.exports = router;