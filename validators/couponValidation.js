const yup = require("yup");

const createCouponSchema = yup.object({
  code: yup
    .string()
    .required("Coupon code is required")
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code cannot exceed 20 characters")
    .matches(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, underscores, or hyphens"),

  type: yup
    .string()
    .oneOf(["percentage", "fixed"], "Type must be either 'percentage' or 'fixed'")
    .required("Coupon type is required"),

  discount: yup
    .number()
    .required("Discount value is required")
    .min(1, "Discount must be at least 1")
    .when("type", {
      is: "percentage",
      then: (schema) => schema.max(100, "Percentage discount cannot exceed 100"),
    }),

  expirationDate: yup
    .date()
    .required("Expiration date is required")
    .min(new Date(), "Expiration date must be in the future"),

  categories: yup
    .array()
    .of(yup.string().required())
    .min(1, "At least one category is required")
    .required("Category ID is required"),

  product_id: yup
    .string()
    .required("Product ID is required"),

  seller: yup
    .string()
    .required("Seller ID is required"),

  usesLeft: yup
    .number()
    .required("Number of uses is required")
    .integer("Uses must be an integer")
    .min(1, "At least one use must be allowed")
});

const updateCouponSchema = yup.object({
  code: yup
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code cannot exceed 20 characters")
    .matches(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, underscores, or hyphens"),

  type: yup
    .string()
    .oneOf(["percentage", "fixed"], "Type must be either 'percentage' or 'fixed'"),

  discount: yup
    .number()
    .min(1, "Discount must be at least 1")
    .when("type", {
      is: "percentage",
      then: (schema) => schema.max(100, "Percentage discount cannot exceed 100"),
    }),

  expirationDate: yup
    .date()
    .min(new Date(), "Expiration date must be in the future"),

  product_id: yup.string(),
  seller: yup.string(),
  usesLeft: yup.number().integer().min(0)
});

module.exports = { createCouponSchema, updateCouponSchema };
