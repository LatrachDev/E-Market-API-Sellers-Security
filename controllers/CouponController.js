const Coupon = require("../models/Coupon");
const { createCouponSchema, updateCouponSchema } = require("../validators/couponValidation");


async function createCoupon(req, res) {
  try {
    // validate request body
    await createCouponSchema.validate(req.body, { abortEarly: false });

    const { code, type, discount, expirationDate, product_id, categories, seller, usesLeft } = req.body;

    if (type === "percentage" && discount > 100) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Invalid discount value, must be below 100%",
      });
    }

    const newCoupon = await Coupon.create({
      code,
      type,
      discount,
      expirationDate,
      product_id,
      categories,
      seller,
      usesLeft,
    });

    return res.status(201).json({
      success: true,
      status: 201,
      message: "Coupon created successfully",
      data: newCoupon,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: error.errors ? error.errors.join(", ") : error.message,
    });
  }
}

  async function getAllCoupons(req, res) {
    try {
      const coupons = await Coupon.find().populate("product_id seller");

      return res.status(200).json({
        success: true,
        status: 200,
        message: "Coupons retrieved successfully",
        data: coupons,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        status: 500,
        message: error.message,
      });
    }
  }

  async function getCouponById(req, res) {
    const { id } = req.params;

    try {
      const coupon = await Coupon.findById(id).populate("product_id seller");

      if (!coupon) {
        return res.status(404).json({
          success: false,
          status: 404,
          message: "Coupon not found",
        });
      }

      return res.status(200).json({
        success: true,
        status: 200,
        message: "Coupon retrieved successfully",
        data: coupon,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        status: 500,
        message: error.message,
      });
    }
  }

  async function updateCoupon(req, res) {
    const { id } = req.params;

    try {
      await updateCouponSchema.validate(req.body, { abortEarly: false });

      const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });

      if (!updatedCoupon) {
        return res.status(404).json({
          success: false,
          status: 404,
          message: "Coupon not found",
        });
      }

      return res.status(200).json({
        success: true,
        status: 200,
        message: "Coupon updated successfully",
        data: updatedCoupon,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: error.errors ? error.errors.join(", ") : error.message,
      });
    }
  }

  async function deleteCoupon(req, res) {
    const { id } = req.params;

    try {
      const deletedCoupon = await Coupon.findByIdAndDelete(id);

      if (!deletedCoupon) {
        return res.status(404).json({
          success: false,
          status: 404,
          message: "Coupon not found",
        });
      }

      return res.status(200).json({
        success: true,
        status: 200,
        message: "Coupon deleted successfully",
        data: deletedCoupon,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        status: 500,
        message: error.message,
      });
    }
  }

module.exports = {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
};
