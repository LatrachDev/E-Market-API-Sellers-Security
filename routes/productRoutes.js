const express = require("express");
const upload = require("../middlewares/uploadImages");
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

const authenticateUser  = require("../middlewares/auth");
const { checkProductOwnership } = require("../middlewares/checkProductOwnership");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getOneProduct);

router.post("/", authenticateUser.authMiddleware, upload.array("images", 5), validate(createProductSchema), createProduct);
router.put("/:id", authenticateUser.authMiddleware, checkProductOwnership, upload.array("images", 5), validate(updateProductSchema), editProduct);

router.delete("/:id", authenticateUser.authMiddleware, checkProductOwnership, deleteProduct);

module.exports = router;