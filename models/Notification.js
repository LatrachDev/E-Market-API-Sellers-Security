// models/Notification.js
const mongoose = require('mongoose');

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
}, { 
  timestamps: true 
});

notificationSchema.index({ recipient: 1,isRead: 1,createdAt: -1 });




module.exports = mongoose.model('Notification', notificationSchema);