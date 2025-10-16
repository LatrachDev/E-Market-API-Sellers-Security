const yup = require('yup');

const createreViewSchema = yup.object({
  comment: yup
    .string()
    .min(3, "Comment must be at least 3 characters long")
    .required("Comment is required"),

  rating: yup
    .number()
    .integer("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5")
    .required("Rating is required"),
});

module.exports = {createreViewSchema};
