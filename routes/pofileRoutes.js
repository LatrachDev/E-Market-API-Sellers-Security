const express = require("express");
const router = express.Router();

const {getProfile, updateProfile}  = require("../controllers/profileController")
const validate  = require("../middlewares/validate");
const { updateProfileSchema } = require("../validators/userValidation");

router.get("/me", getProfile);
router.put("/me", validate(updateProfileSchema), updateProfile);

module.exports = router;