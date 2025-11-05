const Product = require('../models/products')
const Category = require('../models/categories')
const NotificationEmitter = require('../events/notificationEmitter')
const ImageService = require('../services/ImageService')
// const { file } = require("bun");

async function getProducts(req, res, next) {
  try {
    const products = await Product.find()
    if (products.length > 0) {
      res.status(200).json({
        success: true,
        status: 200,
        message: 'products got successfully',
        data: {
          products,
        },
      })
    } else {
      res.status(404).json({
        success: false,
        status: 404,
        message: 'no products found',
        data: null,
      })
    }
  } catch (error) {
    next(error)
  }
}

async function getOneProduct(req, res, next) {
  try {
    const id = req.params.id
    const product = await Product.findById(id)
    if (!product) {
      res.status(404).json({
        success: false,
        status: 404,
        message: 'product not found',
        data: null,
      })
    }
    res.status(200).json({
      success: true,
      status: 200,
      message: 'product ound succesfully',
      data: {
        product,
      },
    })
  } catch (error) {
    next(error)
  }
}

async function createProduct(req, res, next) {
  try {
    const { title, description, price, stock, categories } = req.body
    const seller = req.user._id

    const existingProduct = await Product.findOne({ title })
    if (existingProduct) {
      return res.status(400).json({ message: 'Product already exists' })
    }

    // process images with ImageService
    let images = []
    if (req.files && req.files.length > 0) {
      images = await ImageService.processMultipleImages(req.files)
    }

    const categoryExists = await Category.find({ _id: { $in: categories } })
    if (categoryExists.length !== categories.length) {
      return res
        .status(404)
        .json({ message: 'One or more categories not found' })
    }

    const product = await Product.create({
      title,
      description,
      price,
      stock,
      categories,
      seller,
      images,
      isActive: true,
    })

    if (process.env.NODE_ENV !== 'test') {
      NotificationEmitter.emit('NEW_PRODUCT', {
        recipient: product.seller,
        productId: product._id,
        productName: product.title,
      })
    }

    res.status(201).json({
      success: true,
      status: 200,
      message: 'Product created successfully',
      data: { product },
    })
  } catch (error) {
    next(error)
  }
}

async function editProduct(req, res, next) {
  try {
    const id = req.params.id
    // const newImages = req.files?.map((file) => `/uploads/products/${file.filename}`) || [];

    const product = await Product.findById(id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      })
    }

    let newImages = []
    if (req.files && req.files.length > 0) {
      // delete old images
      if (product.images && product.images.length > 0) {
        for (const img of product.images) {
          await ImageService.deleteImageFiles(img)
        }
      }
      newImages = await ImageService.processMultipleImages(req.files)
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...req.body,
        ...(newImages.length > 0 && { images: newImages }),
      },
      { new: true }
    )

    res.status(200).json({
      success: true,
      status: 200,
      message: 'product Updated successfully ',
      data: {
        product: updatedProduct,
      },
    })
  } catch (error) {
    next(error)
  }
}

async function deleteProduct(req, res, next) {
  try {
    const deleteProduct = await Product.findByIdAndDelete(req.params.id)

    if (!deleteProduct) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: 'product not found',
        data: null,
      })
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Product deleted successfully',
      data: null,
    })
  } catch (error) {
    next(error)
  }
}

async function activateProduct(req, res, next) {
  try {
    const id = req.params.id
    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    product.isActive = true
    await product.save()

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Product activated successfully',
      data: {
        product,
      },
    })
  } catch (error) {
    next(error)
  }
}

async function deactivationProduct(req, res, next) {
  try {
    const id = req.params.id
    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: 'product not found',
        data: null,
      })
    }

    product.isActive = false
    await product.save()

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Product deactivated successfully',
      data: {
        product,
      },
    })
  } catch (error) {
    next(error)
  }
}

async function searchProducts(req, res) {
  try {
    const {
      title,
      categories,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      fields,
    } = req.query

    const limitNum = Math.min(100, Math.max(1, limit))
    const skip = (page - 1) * limitNum
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 }

    const filter = {}

    if (title) {
      filter.$text = { $search: title }
    }

    if (categories) {
      const arr = categories
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      if (arr.length) filter.categories = { $in: arr }
    }

    // Price range
    if (minPrice || maxPrice) {
      const priceFilter = {}
      if (!Number.isNaN(Number(minPrice))) priceFilter.$gte = Number(minPrice)
      if (!Number.isNaN(Number(maxPrice))) priceFilter.$lte = Number(maxPrice)
      if (Object.keys(priceFilter).length) filter.price = priceFilter
    }

    // Choose fields to return
    const projection = fields
      ? fields
          .split(',')
          .map((f) => f.trim())
          .join(' ')
      : ''

    // Fetch results + total count in parallel for better response time
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('categories')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .select(projection)
        .lean()
        .exec(),
      Product.countDocuments(filter).exec(),
    ])

    return res.status(200).json({
      success: true,
      status: 200,
      message: 'Products search results',
      meta: {
        total,
        page,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
      count: products.length,
      data: products,
    })
  } catch (err) {
    console.error('Search error:', err)
    return res.status(500).json({
      success: false,
      status: 500,
      message: 'Error searching products',
      error: 'Server error while searching products',
    })
  }
}

module.exports = {
  getProducts,
  getOneProduct,
  createProduct,
  editProduct,
  deleteProduct,
  deactivationProduct,
  activateProduct,
  searchProducts,
}
