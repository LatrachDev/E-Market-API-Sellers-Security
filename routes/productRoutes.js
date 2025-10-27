const express = require("express");
const upload = require("../middlewares/uploadImages");
const {
  getProducts,
  getOneProduct,
  createProduct,
  editProduct,
  deleteProduct,
  deactivationProduct,
} = require("../controllers/productController");
const validate = require("../middlewares/validate");
const {
  createProductSchema,
  updateProductSchema,
} = require("../validators/productValidation");

const { authMiddleware } = require("../middlewares/auth");
const { checkProductOwnership } = require("../middlewares/checkProductOwnership");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getOneProduct);

router.post("/", authMiddleware, upload.array("images", 5), validate(createProductSchema), createProduct);
router.put("/:id", authMiddleware, checkProductOwnership, upload.array("images", 5), validate(updateProductSchema), editProduct);

router.delete("/:id", authMiddleware, checkProductOwnership, deleteProduct);
router.post("/deactivate/:id", authMiddleware, checkProductOwnership, deactivationProduct);

module.exports = router;
