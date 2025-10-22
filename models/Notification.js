const mongoose = require("mongoose");


const notificationSchema = new mongoose.Schema({
  
  // 1️⃣ DESTINATAIRE (pas "userId" !)
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true  // 🔥 INDEX pour recherches rapides
  },
  
  // 2️⃣ TYPE SPÉCIFIQUE (pas générique)
  type: {
    type: String,
    enum: [
      'NEW_PRODUCT',        
      'ORDER_PLACED',       
      'ORDER_CANCELLED',    
      'ORDER_SHIPPED',     
      'ORDER_DELIVERED',    
      'PAYMENT_RECEIVED', 
      'STOCK_LOW',         
      'SYSTEM' ,
      'ORDER_UPDATED'             
    ],
    required: true
  },
  
  
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  

  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['Product', 'Order','User', 'System'],
      required: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  
 
  isRead: {
    type: Boolean,
    default: false,
    index: true  
  },
  

  createdAt: {
    type: Date,
    default: Date.now,
    index: true  
  }
  
}, {
 
  timestamps: true  
});

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
// const mongoose = require('mongoose');

// const notificationSchema = new mongoose.Schema({
//   recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   type: { type: String, required: true },
//   message: { type: String, required: true },
//   isRead: { type: Boolean, default: false },
// }, { timestamps: true });

// module.exports = mongoose.model('Notification', notificationSchema);
