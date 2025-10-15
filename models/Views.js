const mongoose = require('mongoose');

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
