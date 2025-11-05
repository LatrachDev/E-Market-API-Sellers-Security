const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// indexes to speed up search and filtering
categorySchema.index({ name: 1 })
categorySchema.index({ createdAt: 1 })
categorySchema.index({ updatedAt: 1 })
categorySchema.index({ deletedAt: 1 })
module.exports = mongoose.model('Category', categorySchema)
