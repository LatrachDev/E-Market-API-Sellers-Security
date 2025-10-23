const express = require("express");
const router = express.Router();

const {getProfile, updateProfile}  = require("../controllers/profileController")
const validate  = require("../middlewares/validate");
const { updateProfileSchema } = require("../validators/userValidation");
const { profileGate } = require("../middlewares/authorize");

router.get("/", profileGate, getProfile);
router.put("/", profileGate, validate(updateProfileSchema), updateProfile);

module.exports = router;