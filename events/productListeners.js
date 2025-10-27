// events/productListeners.js
const NotificationEmitter = require('./notificationEmitter');
const Notification = require('../models/Notification');

console.log('📦 Initialisation des product listeners...');

// Listener pour les nouveaux produits
NotificationEmitter.on('NEW_PRODUCT', async ({ recipient, productId, productName }) => {
  try {

    const notification = await Notification.create({
      recipient,
    
      title: 'Nouveau produit disponible !',
      message: `Le produit "${productName}" vient d'être ajouté à la boutique.`,
      relatedEntity: {
        entityType: 'Product',
        entityId: productId
      }
    });
    
    console.log(' Notification créée avec succès - ID:', notification._id);
  } catch (err) {
    console.error(' Erreur lors de la création de la notification');
    console.error('   Message:', err.message);
    console.error('   Stack:', err.stack);
  }
});


NotificationEmitter.on('PRODUCT_APPROVED', async ({ recipient, productId, productName }) => {
  try {
   
    
    const notification = await Notification.create({
      recipient,
      type: 'GENERAL',
      title: 'Produit approuvé !',
      message: `Votre produit "${productName}" a été approuvé et est maintenant visible sur la boutique.`,
      relatedEntity: {
        entityType: 'Product',
        entityId: productId
      }
    });
    
    console.log(' Notification d\'approbation créée - ID:', notification._id);
  } catch (err) {
    console.error(' Erreur notification PRODUCT_APPROVED:', err.message);
  }
});






module.exports = NotificationEmitter;