const express = require("express");
const {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/CouponController");
const { apiLimiter, strictLimiter } = require("../middlewares/rate-limiter");
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Coupon:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier of the coupon
 *         code:
 *           type: string
 *           description: Unique coupon code
 *         type:
 *           type: string
 *           enum: [percentage, fixed]
 *           description: Discount type applied by the coupon
 *         discount:
 *           type: number
 *           description: Discount value (percentage or fixed amount)
 *         expirationDate:
 *           type: string
 *           format: date-time
 *           description: Expiration date of the coupon
 *         product_id:
 *           type: string
 *           nullable: true
 *           description: Identifier of the product the coupon applies to
 *         categories:
 *           type: array
 *           description: Categories impacted by the coupon
 *           items:
 *             type: string
 *         seller:
 *           type: string
 *           description: Identifier of the seller that owns the coupon
 *         usesLeft:
 *           type: integer
 *           description: Remaining number of times the coupon can be used
 *         isDeleted:
 *           type: boolean
 *           description: Soft delete flag
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: "6720b09c0f83f5f64e9a1234"
 *         code: "SUMMER25"
 *         type: "percentage"
 *         discount: 25
 *         expirationDate: "2025-12-31T23:59:59.000Z"
 *         product_id: "66f3e41c51a2a8e0d4f3a9b7"
 *         categories:
 *           - "66efc2de13a0f680cc176012"
 *           - "66efc2de13a0f680cc176045"
 *         seller: "66eabf7f8664310e1b123d45"
 *         usesLeft: 100
 *         isDeleted: false
 *         createdAt: "2024-10-01T10:15:30.000Z"
 *         updatedAt: "2024-10-01T10:15:30.000Z"
 *     CreateCouponInput:
 *       type: object
 *       required:
 *         - code
 *         - type
 *         - discount
 *         - expirationDate
 *         - product_id
 *         - categories
 *         - seller
 *         - usesLeft
 *       properties:
 *         code:
 *           type: string
 *           description: Unique coupon code (uppercase letters, numbers, dashes or underscores)
 *         type:
 *           type: string
 *           enum: [percentage, fixed]
 *         discount:
 *           type: number
 *           minimum: 1
 *         expirationDate:
 *           type: string
 *           format: date-time
 *         product_id:
 *           type: string
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *         seller:
 *           type: string
 *         usesLeft:
 *           type: integer
 *           minimum: 1
 *       example:
 *         code: "WINTER10"
 *         type: "fixed"
 *         discount: 10
 *         expirationDate: "2025-01-31T23:59:59.000Z"
 *         product_id: "66f3e41c51a2a8e0d4f3a9b7"
 *         categories:
 *           - "66efc2de13a0f680cc176012"
 *         seller: "66eabf7f8664310e1b123d45"
 *         usesLeft: 50
 *     UpdateCouponInput:
 *       type: object
 *       description: At least one field must be provided
 *       properties:
 *         code:
 *           type: string
 *         type:
 *           type: string
 *           enum: [percentage, fixed]
 *         discount:
 *           type: number
 *           minimum: 1
 *         expirationDate:
 *           type: string
 *           format: date-time
 *         product_id:
 *           type: string
 *           nullable: true
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *         seller:
 *           type: string
 *         usesLeft:
 *           type: integer
 *           minimum: 0
 *       example:
 *         discount: 15
 *         usesLeft: 25
 *     CouponResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         status:
 *           type: integer
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/Coupon'
 *     CouponListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         status:
 *           type: integer
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Coupon'
 */

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Manage discount coupons for products and categories
 */

/**
 * @swagger
 * /coupons:
 *   post:
 *     summary: Create a new coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCouponInput'
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CouponResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Internal server error
 */
router.post("/", strictLimiter, createCoupon);

/**
 * @swagger
 * /coupons:
 *   get:
 *     summary: Retrieve all coupons
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupons retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CouponListResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", apiLimiter, getAllCoupons);

/**
 * @swagger
 * /coupons/{id}:
 *   get:
 *     summary: Retrieve a coupon by ID
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Coupon identifier
 *     responses:
 *       200:
 *         description: Coupon retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CouponResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Coupon not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", apiLimiter, getCouponById);

/**
 * @swagger
 * /coupons/{id}:
 *   put:
 *     summary: Update an existing coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Coupon identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCouponInput'
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CouponResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Coupon not found
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Internal server error
 */
router.put("/:id", strictLimiter, updateCoupon);

/**
 * @swagger
 * /coupons/{id}:
 *   delete:
 *     summary: Delete a coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Coupon identifier
 *     responses:
 *       200:
 *         description: Coupon deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CouponResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Coupon not found
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", strictLimiter, deleteCoupon);

module.exports = router;
