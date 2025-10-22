const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const controller = new NotificationController();

// ✅ Passer juste la référence à la fonction, pas avec ()
router.get('/', controller.getNotifications.bind(controller));
router.patch('/:id/read', controller.markAsRead.bind(controller));

module.exports = router;
