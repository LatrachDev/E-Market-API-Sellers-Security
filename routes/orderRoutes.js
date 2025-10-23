const express = require("express");
const { createOrder ,getOrders ,simulatePaymentController  ,updateStockAfterOrder,updateOrderStatus} = require("../controllers/orderController");
const router = express.Router();
const auth=require('../middlewares/auth');


router.post("/",auth.authMiddleware, createOrder);
router.get("/", getOrders);
router.post("/simulate-payment", simulatePaymentController);
router.put("/", updateStockAfterOrder);
router.put("/:orderId/status",auth.authMiddleware, updateOrderStatus);

module.exports = router;
