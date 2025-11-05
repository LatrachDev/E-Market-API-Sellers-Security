const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'seller', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
)
// indexes to speed up search and filtering
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ createdAt: 1 })
userSchema.index({ updatedAt: 1 })

module.exports = mongoose.model('User', userSchema)
