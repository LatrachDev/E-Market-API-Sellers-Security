const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    categories: 
    [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true 
      }
    ],
    images: 
    [
      {
        type: String, 
        trim: true,
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
    type: Date,
    default: null,
    }
},
{
  timestamps: true,
}
);

module.exports = mongoose.model("Product", productSchema);
