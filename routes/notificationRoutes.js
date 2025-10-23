// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const controller = new NotificationController();
const auth = require('../middlewares/auth');


router.get('/',auth.authMiddleware, controller.getNotifications);

router.patch('/:id/read', auth.authMiddleware,controller.markAsRead);
router.patch('/read/all', auth.authMiddleware, controller.markAllAsRead);

router.delete('/:id', auth.authMiddleware, controller.deleteNotification);



module.exports = router;