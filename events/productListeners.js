// events/productListeners.js
const NotificationEmitter = require('./notificationEmitter');
const Notification = require('../models/Notification');

console.log('📦 Initialisation des product listeners...');

// Listener pour les nouveaux produits
NotificationEmitter.on('NEW_PRODUCT', async ({ recipient, productId, productName }) => {
  try {
    console.log('🔔 Événement NEW_PRODUCT reçu');
    console.log('   - Produit:', productName);
    console.log('   - Destinataire:', recipient);
    console.log('   - ID Produit:', productId);
    
    const notification = await Notification.create({
      recipient,
      type: 'NEW_PRODUCT',
      title: 'Nouveau produit disponible !',
      message: `Le produit "${productName}" vient d'être ajouté à la boutique.`,
      relatedEntity: {
        entityType: 'Product',
        entityId: productId
      }
    });
    
    console.log('✅ Notification créée avec succès - ID:', notification._id);
  } catch (err) {
    console.error('❌ Erreur lors de la création de la notification');
    console.error('   Message:', err.message);
    console.error('   Stack:', err.stack);
  }
});

// Listener pour les produits approuvés par l'admin
NotificationEmitter.on('PRODUCT_APPROVED', async ({ recipient, productId, productName }) => {
  try {
    console.log('🔔 Événement PRODUCT_APPROVED reçu');
    
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
    
    console.log('✅ Notification d\'approbation créée - ID:', notification._id);
  } catch (err) {
    console.error('❌ Erreur notification PRODUCT_APPROVED:', err.message);
  }
});

// Listener pour les produits rejetés
NotificationEmitter.on('PRODUCT_REJECTED', async ({ recipient, productId, productName, reason }) => {
  try {
    console.log('🔔 Événement PRODUCT_REJECTED reçu');
    
    const notification = await Notification.create({
      recipient,
      type: 'GENERAL',
      title: 'Produit rejeté',
      message: `Votre produit "${productName}" a été rejeté. Raison: ${reason || 'Non spécifiée'}`,
      relatedEntity: {
        entityType: 'Product',
        entityId: productId
      }
    });
    
    console.log('✅ Notification de rejet créée - ID:', notification._id);
  } catch (err) {
    console.error('❌ Erreur notification PRODUCT_REJECTED:', err.message);
  }
});

console.log('✅ Product listeners enregistrés avec succès');

module.exports = NotificationEmitter;