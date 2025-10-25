const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - recipient
 *         - title
 *         - message
 *       properties:
 *         _id:
 *           type: string
 *           description: ID unique de la notification
 *           example: 650f3c8b7a8e3a001234abcd
 *         recipient:
 *           type: string
 *           description: ID de l'utilisateur destinataire
 *           example: 650f3a1d7a8e3a001234abcd
 *         title:
 *           type: string
 *           description: Titre de la notification
 *           example: "Nouvelle commande"
 *         message:
 *           type: string
 *           description: Message de la notification
 *           example: "Votre commande #1234 a été expédiée."
 *         relatedEntity:
 *           type: object
 *           properties:
 *             entityType:
 *               type: string
 *               enum: ['Product', 'Order', 'User', 'Review']
 *               description: Type d'entité liée à la notification
 *               example: "Order"
 *             entityId:
 *               type: string
 *               description: ID de l'entité liée
 *               example: 650f3b2d7a8e3a001234abcd
 *         isRead:
 *           type: boolean
 *           description: Indique si la notification a été lue
 *           example: false
 *         readAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Date de lecture de la notification
 *           example: null
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Date de suppression de la notification
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *           example: 2025-10-24T10:15:30.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour
 *           example: 2025-10-24T10:20:45.000Z
 */

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['Product', 'Order', 'User', 'Review']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
