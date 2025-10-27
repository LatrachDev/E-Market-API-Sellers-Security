const Products = require("../models/products");
const Category = require("../models/categories");

// const { file } = require("bun");

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The product's title
 *         description:
 *           type: string
 *           description: The product description
 *         price:
 *           type: number
 *           description: The product price
 *         stock:
 *           type: number
 *           description: The product stock
 *         category_id:
 *           type: string
 *           description: The product category id
 *         imageUrl:
 *           type: string
 *           description: The product image
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *       required:
 *         - title
 *         - description
 *         - price
 *         - stock
 *         - category_id
 */

// get all products

/**
 * @swagger
 * /products:
 *   get:
 *     summary: get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Products got successfully
 *       500:
 *         description: Server error
 */

async function getProducts(req, res, next) {
  try {
    const products = await Products.find();
    res.status(200).json({
      message: "all products found",
      products: products,
    });
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

// get a specific product
/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: get one specific product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: product got successfully
 *       500:
 *         description: Server error
 */
async function getOneProduct(req, res, next) {
  try {
    const id = req.params.id;
    const product = await Products.findById(id);
    if (!product) {
      res.status(400).json({ message: "product not found" });
    }
    res.status(200).json({
      message: "product found succesfully",
      product: product,
    });
  } catch (error) {
    next(error);
  }
}

// create a product
/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product created successfully
 *       500:
 *         description: Server error
 */

async function createProduct(req, res, next) {
  try {
    const { title, description, price, stock, categories } = req.body;
    
    console.log("request body fiha hadchi .. :", req.body);
    const seller = req.user._id;
    console.log("hahoa seller dyalna :", seller);

    const existingProduct = await Products.findOne({ title });

    if (existingProduct) {
      return res.status(400).json({ message: "Product already exists" });
    }

    const images = req.files?.map((file) => `/uploads/products/${file.filename}`) || [];

    const categoryExists = await Category.find({ _id: { $in: categories } });
    if (categoryExists.length !== categories.length) {
      return res.status(404).json({ message: 'One or more categories not found' });
    }
  
    const product = await Products.create({
      title,
      description,
      price,
      stock,
      categories,
      seller,
      images,
      isActive: false,
    });
   if (process.env.NODE_ENV !== "test") {
NotificationEmitter.emit('NEW_PRODUCT', {
  recipient: product.seller,
  productId: product._id,
  productName: product.title,
});}

    res.status(201).json({
      message: "product created successfully (awaiting admin approval)",
    
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

// Edit product
/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update an existing product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               category:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid input or category not found
 *       500:
 *         description: Server error
 */
async function editProduct(req, res, next) {
  try {
    const id = req.params.id;
    const newImages = req.files?.map((file) => `/uploads/products/${file.filename}`) || [];

    const updatedProduct = await Products.findByIdAndUpdate(
      id,
      {
        ...req.body,
        ...(newImages.length > 0 && { images: newImages }), 
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.status(200).json({
      message: "product Updated successfully ",
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
}

// Delete product
/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       500:
 *         description: Server error
 */

async function deleteProduct(req, res, next) {
  try {
    await Products.findByIdAndDelete(req.params.id);
    res.status(200).json("product deleted successfully");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getOneProduct,
  createProduct,
  editProduct,
  deleteProduct,
};