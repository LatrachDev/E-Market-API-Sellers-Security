const notificationEmitter = require('./notificationEmitter');
const Notification = require('../../models/Notification');
const User = require('../../models/user'); // pour récupérer les destinataires

notificationEmitter.on('NEW_PRODUCT', async (product) => {
  try {
   
    const users = await User.find(); 

    const notifications = users.map(user => ({
      recipient: user._id,
      type: 'NEW_PRODUCT',
      title: 'Nouveau produit disponible',
      message: `Le produit "${product.title}" vient d'être ajouté.`,
      relatedEntity: {
        entityType: 'Product',
        entityId: product._id
      }
    }));

    // Créer toutes les notifications
    await Notification.insertMany(notifications);
    console.log('Notifications envoyées à tous les utilisateurs');
  } catch (err) {
    console.error('Erreur lors de la création de notifications:', err);
  }
});
