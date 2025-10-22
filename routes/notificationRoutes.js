// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const controller = new NotificationController();


router.get('/', controller.getNotifications);




router.patch('/:id/read', controller.markAsRead);


module.exports = router;