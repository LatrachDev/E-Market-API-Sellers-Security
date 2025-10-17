const express = require("express");

const { register , login } = require("../controllers/authController");
const validate = require("../middlewares/validate");
const { userSchema } = require("../validators/userValidation");

const router = express.Router();

router.post("/signup", validate(userSchema), register);


module.exports = router;
