const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - comment
 *         - rating
 *         - productId
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *           description: ID unique de la review (MongoDB)
 *           example: 650f3c8b7a8e3a001234abcd
 *         comment:
 *           type: string
 *           description: Commentaire de l'utilisateur
 *           example: "Produit très bien !"
 *         rating:
 *           type: number
 *           description: Note attribuée par l'utilisateur (1 à 5)
 *           minimum: 1
 *           maximum: 5
 *           example: 4
 *         productId:
 *           type: string
 *           description: ID du produit associé
 *           example: 650f3b2d7a8e3a001234abcd
 *         userId:
 *           type: string
 *           description: ID de l'utilisateur ayant laissé la review
 *           example: 650f3a1d7a8e3a001234abcd
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Date de suppression (null si non supprimé)
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

const viewSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  deletedAt: {           
    type: Date,
    default: null
  }
}, 
{ timestamps: true }      
);

module.exports = mongoose.model('View', viewSchema);
