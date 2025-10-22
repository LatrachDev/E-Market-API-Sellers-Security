const express = require("express");
const { createOrder ,getOrders ,simulatePaymentController  ,updateStockAfterOrder} = require("../controllers/orderController");
const router = express.Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.post("/simulate-payment", simulatePaymentController);
router.put("/", updateStockAfterOrder);

module.exports = router;
