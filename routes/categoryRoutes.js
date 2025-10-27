const express = require("express");
const {
  getCategories,
  getOneCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const {apiLimiter,strictLimiter}=require('../middlewares/rate-limiter')
const router = express.Router();

router.get("/", apiLimiter,getCategories);
router.get("/:id",apiLimiter ,getOneCategory);
router.post("/", strictLimiter,createCategory);
router.put("/:id",strictLimiter, updateCategory);
router.delete("/:id", strictLimiter,deleteCategory);

module.exports = router;
