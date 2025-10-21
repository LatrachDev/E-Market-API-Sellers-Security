const express = require("express");
const {
  getProducts,
  getOneProduct,
  createProduct,
  editProduct,
  deleteProduct,
} = require("../controllers/productController");
const validate = require("../middlewares/validate");
const {
  createProductSchema,
  updateProductSchema,
} = require("../validators/productValidation");

const { authenticateUser } = require("../middlewares/auth");
const { checkProductOwnership } = require("../middlewares/checkProductOwnership");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getOneProduct);
router.post("/", authenticateUser, validate(createProductSchema), createProduct);
router.put("/:id", authenticateUser, checkProductOwnership, validate(updateProductSchema), editProduct);
router.delete("/:id", authenticateUser, checkProductOwnership, deleteProduct);

module.exports = router;
