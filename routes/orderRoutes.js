const express = require("express");
const { createOrder ,getOrders ,simulatePaymentController } = require("../controllers/orderController");
const router = express.Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.post("/simulate-payment", simulatePaymentController);


module.exports = router;
