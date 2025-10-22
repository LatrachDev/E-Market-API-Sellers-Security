const Notification = require('../models/Notification');

class NotificationController {
  // récupérer toutes les notifications d’un utilisateur
  async getNotifications(req, res) {
    try {
      const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
      res.status(200).json(notifications);
    } catch (err) {
      res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
  }

  // marquer une notification comme lue
  async markAsRead(req, res) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
      );
      if (!notification) return res.status(404).json({ message: 'Notification introuvable' });
      res.status(200).json(notification);
    } catch (err) {
      res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
  }
}

module.exports = NotificationController;
