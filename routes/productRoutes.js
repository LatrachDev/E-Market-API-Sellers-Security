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


const { checkProductOwnership } = require("../middlewares/checkProductOwnership");
const {apiLimiter,strictLimiter}=require('../middlewares/rate-limiter');

const router = express.Router();

router.get("/",apiLimiter, getProducts);
router.get("/:id",apiLimiter,getOneProduct);

router.post("/", strictLimiter, upload.array("images", 5), validate(createProductSchema), createProduct);
router.put("/:id", strictLimiter, checkProductOwnership, upload.array("images", 5), validate(updateProductSchema), editProduct);

router.delete("/:id",strictLimiter,  checkProductOwnership, deleteProduct);

module.exports = router;