const { required } = require('joi');
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({

  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },

  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Coupon type is required'],
    default: 'percentage'
  },

  discount: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [1, 'Discount must be at least 1']
  },

  expirationDate: {
    type: Date,
    required: [true, 'Expiration date is required']
  },

  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    // required: [true, 'Product ID is required'],
        required: false, // ✅ le rendre optionnel

  },

  categories: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category ID is required'],
        index: true
    },
  ],

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required'],
  },

  usesLeft: {
    type: Number,
    required: [true, 'Number of uses is required'],
    min: [0, 'Uses left cannot be negative']
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedAt: {
    type: Date,
    default: null
  }

}, {
  timestamps: true,
  versionKey: false //removes the __v version field from documents
});

couponSchema.index({ code: 1 }, { unique: true }); // in db.. no two coupons can have the same code

couponSchema.methods.decrementUse = async function () {
  if (this.usesLeft > 0) {
    this.usesLeft -= 1;
    await this.save();
  }
  return this;
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;