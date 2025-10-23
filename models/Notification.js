// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Pour optimiser les requêtes
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
  }
}, { 
  timestamps: true 
});

notificationSchema.index({ recipient: 1,isRead: 1,createdAt: -1 });




module.exports = mongoose.model('Notification', notificationSchema);