// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const controller = new NotificationController();
const auth = require('../middlewares/auth');


router.get('/',auth.authMiddleware, controller.getNotifications);




router.patch('/:id/read', controller.markAsRead);


module.exports = router;