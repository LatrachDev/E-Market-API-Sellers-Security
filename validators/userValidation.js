const yup = require("yup");

const userSchema = yup.object({
  fullname: yup
    .string()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("invalid email format"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  role: yup.string().oneOf(["admin", "seller", "user"]),
});

const registerSchema = yup.object({
  fullname: yup.string().required("Name is required").min(3, "Name must be at least 3 characters"),
  email: yup.string().required("Email is required").email("invalid email format"),
  password: yup.string().required("Password is required").min(8, "Password must be at least 8 characters"),
});

const loginSchema = yup.object({
  email: yup.string().required("Email is required").email("invalid email format"),
  password: yup.string().required("Password is required"),
});


module.exports = {
  userSchema,
  registerSchema,
  loginSchema,
};

