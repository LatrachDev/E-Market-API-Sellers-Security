const express = require("express");

const { register , login } = require("../controllers/authController");
const validate = require("../middlewares/validate");
const { registerSchema, loginSchema } = require("../validators/userValidation");

const router = express.Router();

router.post("/signup", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

module.exports = router;
