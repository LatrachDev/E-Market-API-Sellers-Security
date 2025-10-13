const Categories = require("../models/categories");

/**
 * @swagger
 * components:
 *   schemas:
 *     Categories:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The user's full name
 *       required:
 *         - name
 */

// get all users

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories got successfully
 *       500:
 *         description: Server error
 */

async function getCategories(req, res, next) {
  try {
    const categories = await Categories.find();
    res.status(200).json({
      message: "all categories found",
      categories: categories,
    });
  } catch (error) {
    next(error);
  }
}

// get a specific category
/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: get one specific category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The Category ID
 *     responses:
 *       200:
 *         description: category got successfully
 *       500:
 *         description: Server error
 */
async function getOneCategory(req, res, next) {
  try {
    const id = req.params.id;
    const category = await Categories.findById(id);
    if (!category) {
      res.status(400).json({ message: "category not found" });
    }
    res.status(200).json({
      message: "category found succesfully",
      category: category,
    });
  } catch (error) {
    next(error);
  }
}

// create a category
/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Category created successfully
 *       500:
 *         description: Server error
 */
async function createCategory(req, res, next) {
  try {
    const { name } = req.body;
    const existingCategory = await Categories.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category name must be unique" });
    }
    const category = await Categories.create({
      name,
    });
    res.status(201).json({
      message: "product created successfully",
      category: category.toObject(),
    });
  } catch (error) {
    next(error);
  }
}

// Update category
/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update an existing category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid input or category not found
 *       500:
 *         description: Server error
 */
async function updateCategory(req, res, next) {
  try {
    const id = req.params.id;
    const category = await Categories.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
      },
      { new: true }
    );
    res.status(200).json({
      message: "category updated succesfully",
      category: category,
    });
  } catch (error) {
    next(error);
  }
}

// Delete category
/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       500:
 *         description: Server error
 */

async function deleteCategory(req, res, next) {
  try {
    await Categories.findByIdAndDelete(req.params.id);
    res.status(200).json("category deleted successfully");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  getOneCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
