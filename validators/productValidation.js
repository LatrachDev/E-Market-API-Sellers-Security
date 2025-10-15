const yup = require("yup");

const createProductSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters"),
  description: yup.string().required("Description is required"),
  price: yup.number().positive().required("Price is required"),
  stock: yup.number().integer().required("Stock is required").min(0),
  categories: yup
    .array()
    .of(yup.string().required("Category is required"))
    .min(1, "At least one category is required")
    .required("Category is required"),
  images: yup
    .array()
    .of(yup.string().url("Invalid image URL"))
    .min(1, "At least one image is required")
    .required("Images are required"),
  });

const updateProductSchema = yup.object({
  title: yup.string(),
  description: yup.string(),
  price: yup.number().positive(),
  stock: yup.number().integer().min(0),
  categories: yup.array(),
  images: yup.array().nullable(),
});

module.exports = { createProductSchema, updateProductSchema };
