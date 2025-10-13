const yup = require("yup");

const createProductSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters"),
  description: yup.string().required("Description is required"),
  price: yup.number().positive().required("Price is required"),
  stock: yup.number().integer().required("Stock is required").min(0),
  category_id: yup.string().required("Category is required"),
  imageUrl: yup.string().url("Invalid image URL").nullable().notRequired(),
});

const updateProductSchema = yup.object({
  title: yup.string(),
  description: yup.string(),
  price: yup.number().positive(),
  stock: yup.number().integer().min(0),
  category_id: yup.string(),
  imageUrl: yup.string().url("Invalid image URL").nullable(),
});

module.exports = { createProductSchema, updateProductSchema };
