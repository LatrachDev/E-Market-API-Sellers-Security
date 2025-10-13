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
const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getOneProduct);
router.post("/", validate(createProductSchema), createProduct);
router.put("/:id", validate(updateProductSchema), editProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
