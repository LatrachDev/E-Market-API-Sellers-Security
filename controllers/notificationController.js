
const Notification = require('../models/Notification');

class NotificationController {
  
  async getNotifications(req, res, next) {
    try {
      const userId = req.user?._id;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;

      const query = { recipient: userId };
      if (unreadOnly === 'true') {
        query.isRead = false;
      }


      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({
        recipient: userId,
        isRead: false
      });

      res.json({
        notifications,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          unreadCount
        }
      });

    } catch (error) {
      console.error(' Erreur getNotifications:', error.message);
      next(error);
    }
  }

 
   
  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?._id ;

      const notification = await Notification.findOneAndUpdate(
        { _id: id, recipient: userId },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ message: 'Notification introuvable' });
      }

      res.json({
        message: 'Notification marquée comme lue',
        notification
      });

    } catch (error) {
      console.error(' Erreur markAsRead:', error.message);
      next(error);
    }
  }
 async markAllAsRead(req, res) {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { recipient: userId, isRead: false, isDeleted: null },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      status: 200,
      message: "Toutes les notifications ont été marquées comme lues",
      data: {
        modifiedCount: result.modifiedCount 
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 500,
      message: "Erreur serveur",
      data: {
        error: error.message
      }
    });
  }
}
async deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

   
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Notification introuvable ou déjà supprimée",
        data: {}
      });
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "Notification supprimée (soft delete)",
      data: {
        id: notification._id,
        deletedAt: notification.deletedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 500,
      message: "Erreur serveur",
      data: { error: error.message }
    });
  }
}



  
  

 
 
}

module.exports = NotificationController;