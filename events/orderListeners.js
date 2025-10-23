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
NotificationEmitter.on('ORDER_UPDATED', async ({ recipient, orderId, newStatus }) => {
  try {
    await Notification.create({
      recipient,
      title: 'Statut de commande mis à jour !',
      message: `La commande "${orderId}" a été mise à jour. Nouveau statut : "${newStatus}".`,
      relatedEntity: {
        entityType: 'Order',
        entityId: orderId
      }
    });
    console.log(`Notification créée pour la mise à jour de la commande : ${orderId}, nouveau statut : ${newStatus}`);
  } catch (err) {
    console.error('Erreur lors de la création de la notification de mise à jour :', err);
  }
});

