const express = require("express");
const {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon
} = require("../controllers/CouponController");
const {apiLimiter,strictLimiter}=require('../middlewares/rate-limiter');
const router = express.Router();


router.post("/",strictLimiter, createCoupon);
router.get("/", apiLimiter,getAllCoupons);
router.get("/:id", apiLimiter,getCouponById);
router.put("/:id",strictLimiter ,updateCoupon);
router.delete("/:id", strictLimiter,deleteCoupon);

module.exports = router;
