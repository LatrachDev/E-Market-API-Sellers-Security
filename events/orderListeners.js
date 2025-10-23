const NotificationEmitter = require('./notificationEmitter');
const Notification = require('../models/Notification');

NotificationEmitter.on('ORDER_PASS', async ({recipient, orderId}) => {
  try {
    await Notification.create({
      recipient,
     
      title: 'Nouvelle commande passée !',
      message: `La commande "${orderId}" a été passée.`,
      relatedEntity: {
        entityType: 'Order',
        entityId: orderId
      }
    });

    console.log(` Notification créée pour la commande : ${orderId}`);
  } catch (err) {
    console.error(' Erreur lors de la création de la notification :', err);
  }
});
