const request = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');
const app = require('../server');
const Review = require('../models/review');
const Order = require('../models/Order');
const Product = require('../models/products');
const User = require('../models/user');
const { generateToken } = require('../services/jwt');
require("dotenv").config();

describe('Review Controller - Integration Tests', () => {
  let userToken, adminToken;
  let testUser, testAdmin, testProduct, testOrder;
  let createdReviewId;

  // Connexion à la base de données de test avant tous les tests
  before(async () => {
    const testDbUri = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/marketSeller_test' || process.env.MONGO_URI ;
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testDbUri);
    }

    // Nettoyer les collections
    await Review.deleteMany({});
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    // Créer un utilisateur test
    testUser = await User.create({
      fullname: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'user'
    });

    // Créer un admin test
    testAdmin = await User.create({
      fullname: 'Test Admin',
      email: 'testadmin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    // Créer un produit test
    testProduct = await Product.create({
      title: 'Test Product',
      description: 'A test product',
      price: 100,
      stock: 10,
      categories: [],
      seller: testAdmin._id,
      isActive: true
    });

    // Créer une commande test (simulant un achat)
    testOrder = await Order.create({
      user: testUser._id,
      items: [{
        product: testProduct._id,
        quantity: 1,
        price: 100,
        seller: testAdmin._id
      }],
      total: 100,
      status: 'paid',
      paymentStatus: 'paid'
    });

    // Générer des tokens JWT
    userToken = generateToken({
      id: testUser._id,
      email: testUser.email,
      role: testUser.role
    });

    adminToken = generateToken({
      id: testAdmin._id,
      email: testAdmin.email,
      role: testAdmin.role
    });
  });

  // Nettoyer après tous les tests
 after(async function() {
  this.timeout(15000); // Important !
  
  try {
    await Review.deleteMany({});
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
  }
});

  describe('POST /:productId/review - Create Review', () => {
    afterEach(async () => {
      await Review.deleteMany({ userId: testUser._id });
    });

    it('devrait créer un avis avec succès', async () => {
      const res = await request(app)
        .post(`/product/${testProduct._id}/review`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rating: 5,
          comment: 'Excellent produit!'
        });

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.data).to.have.property('rating', 5);
      expect(res.body.data).to.have.property('comment', 'Excellent produit!');
      
      createdReviewId = res.body.data._id;
    });

    it('devrait refuser si l\'utilisateur n\'a pas acheté le produit', async () => {
      // Créer un nouvel utilisateur sans commande
      const newUser = await User.create({
        fullname: 'No Order User',
        email: 'noorder@example.com',
        password: 'password123',
        role: 'user'
      });

      const noOrderToken = generateToken({
        id: newUser._id,
        email: newUser.email,
        role: newUser.role
      });

      const res = await request(app)
        .post(`/product/${testProduct._id}/review`)
        .set('Authorization', `Bearer ${noOrderToken}`)
        .send({
          rating: 5,
          comment: 'Test comment'
        });

      expect(res.status).to.equal(403);
      expect(res.body.message).to.include('avant d\'avoir acheté ce produit');

      await User.deleteOne({ _id: newUser._id });
    });

    it('devrait refuser si l\'utilisateur a déjà laissé un avis', async () => {
      // Créer un premier avis
      await Review.create({
        rating: 4,
        comment: 'Premier avis',
        productId: testProduct._id,
        userId: testUser._id
      });

      const res = await request(app)
        .post(`/product/${testProduct._id}/review`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rating: 5,
          comment: 'Deuxième avis'
        });

      expect(res.status).to.equal(409);
      expect(res.body.message).to.include('déjà laissé un avis');
    });

    it('devrait refuser si pas de token d\'authentification', async () => {
      const res = await request(app)
        .post(`/product/${testProduct._id}/review`)
        .send({
          rating: 5,
          comment: 'Test sans auth'
        });

      expect(res.status).to.be.oneOf([401, 403]);
    });

    it('devrait refuser si les données sont invalides', async () => {
      const res = await request(app)
        .post(`/product/${testProduct._id}/review`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rating: 10, // Rating invalide (devrait être entre 1-5)
          comment: ''
        });

      expect(res.status).to.be.oneOf([400, 422]);
    });
  });

  describe('GET /:productId/review - Get All Reviews', () => {
    before(async () => {
      // Créer quelques avis pour le test
      await Review.create([
        {
          rating: 5,
          comment: 'Très bon',
          productId: testProduct._id,
          userId: testUser._id
        },
        {
          rating: 4,
          comment: 'Bien',
          productId: testProduct._id,
          userId: testAdmin._id
        }
      ]);
    });

    after(async () => {
      await Review.deleteMany({ productId: testProduct._id });
    });

    it('devrait récupérer tous les avis d\'un produit', async () => {
      const res = await request(app)
        .get(`/product/${testProduct._id}/review`);

      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.at.least(2);
      expect(res.body.count).to.equal(res.body.data.length);
    });

    it('devrait retourner 404 si aucun avis trouvé', async () => {
      const newProduct = await Product.create({
        title: 'Product sans avis',
        description: 'test',
        price: 50,
        stock: 5,
        categories: [],
        seller: testAdmin._id,
        isActive: true
      });

      const res = await request(app)
        .get(`/product/${newProduct._id}/review`);

      expect(res.status).to.equal(404);
      expect(res.body.message).to.include('No reviews found');

      await Product.deleteOne({ _id: newProduct._id });
    });
  });

  describe('PUT /:productId/review/:id - Update User Review', () => {
    let reviewToUpdate;

    beforeEach(async () => {
      reviewToUpdate = await Review.create({
        rating: 3,
        comment: 'Commentaire initial',
        productId: testProduct._id,
        userId: testUser._id
      });
    });

    afterEach(async () => {
      await Review.deleteMany({ userId: testUser._id });
    });

    it('devrait mettre à jour l\'avis de l\'utilisateur', async () => {
      const res = await request(app)
        .put(`/product/${testProduct._id}/review/${reviewToUpdate._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rating: 5,
          comment: 'Commentaire mis à jour!'
        });

      expect(res.status).to.equal(200);
      expect(res.body.data.rating).to.equal(5);
      expect(res.body.data.comment).to.equal('Commentaire mis à jour!');
    });

    it('devrait refuser si l\'utilisateur tente de modifier l\'avis d\'un autre', async () => {
      const res = await request(app)
        .put(`/product/${testProduct._id}/review/${reviewToUpdate._id}`)
        .set('Authorization', `Bearer ${adminToken}`) // Admin essaie de modifier l'avis user
        .send({
          rating: 1,
          comment: 'Hack attempt'
        });

      expect(res.status).to.equal(403);
      expect(res.body.message).to.include('ne pouvez pas modifier');
    });

    it('devrait refuser si pas authentifié', async () => {
      const res = await request(app)
        .put(`/product/${testProduct._id}/review/${reviewToUpdate._id}`)
        .send({
          rating: 5,
          comment: 'Test'
        });

      expect(res.status).to.be.oneOf([401, 403]);
    });
  });

  describe('DELETE /:productId/review/:id - Delete User Review', () => {
    let reviewToDelete;

    beforeEach(async () => {
      reviewToDelete = await Review.create({
        rating: 3,
        comment: 'À supprimer',
        productId: testProduct._id,
        userId: testUser._id
      });
    });

    afterEach(async () => {
      await Review.deleteMany({ userId: testUser._id });
    });

    it('devrait supprimer (soft delete) l\'avis de l\'utilisateur', async () => {
      const res = await request(app)
        .delete(`/product/${testProduct._id}/review/${reviewToDelete._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.include('supprimée');

      // Vérifier que deletedAt est défini
      const deletedReview = await Review.findById(reviewToDelete._id);
      expect(deletedReview.deletedAt).to.not.be.null;
    });

    it('devrait refuser si l\'utilisateur tente de supprimer l\'avis d\'un autre', async () => {
      const res = await request(app)
        .delete(`/product/${testProduct._id}/review/${reviewToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(403);
    });

    it('devrait refuser de supprimer à nouveau un avis déjà supprimé', async () => {
      // Première suppression
      await request(app)
        .delete(`/product/${testProduct._id}/review/${reviewToDelete._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      // Deuxième tentative
      const res = await request(app)
        .delete(`/product/${testProduct._id}/review/${reviewToDelete._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('Déjà supprimée');
    });
  });

  describe('PUT /review/:id - Admin Update Review', () => {
    let adminReview;

    beforeEach(async () => {
      adminReview = await Review.create({
        rating: 3,
        comment: 'Avis admin',
        productId: testProduct._id,
        userId: testUser._id
      });
    });

    afterEach(async () => {
      await Review.deleteMany({ _id: adminReview._id });
    });

    it('devrait permettre à l\'admin de modifier n\'importe quel avis', async () => {
      const res = await request(app)
        .put(`/product/review/${adminReview._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rating: 5,
          comment: 'Modifié par admin'
        });

      expect(res.status).to.equal(200);
      expect(res.body.data.rating).to.equal(5);
      expect(res.body.data.comment).to.equal('Modifié par admin');
    });

    it('devrait retourner 404 si l\'avis n\'existe pas', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/product/review/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rating: 5,
          comment: 'Test'
        });

      expect(res.status).to.equal(404);
    });
  });

  describe('DELETE /review/:id - Admin Delete Review', () => {
    let adminDeleteReview;

    beforeEach(async () => {
      adminDeleteReview = await Review.create({
        rating: 1,
        comment: 'Avis à supprimer',
        productId: testProduct._id,
        userId: testUser._id
      });
    });

    afterEach(async () => {
      await Review.deleteMany({ _id: adminDeleteReview._id });
    });

    it('devrait permettre à l\'admin de supprimer n\'importe quel avis', async () => {
      const res = await request(app)
        .delete(`/product/review/${adminDeleteReview._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.include('supprimée');

      // Vérifier le soft delete
      const deletedReview = await Review.findById(adminDeleteReview._id);
      expect(deletedReview.deletedAt).to.not.be.null;
    });

    it('devrait retourner 404 si l\'avis n\'existe pas', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/product/review/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(404);
    });

    it('devrait refuser de supprimer un avis déjà supprimé', async () => {
      // Première suppression
      await request(app)
        .delete(`/product/review/${adminDeleteReview._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Deuxième tentative
      const res = await request(app)
        .delete(`/product/review/${adminDeleteReview._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('Déjà supprimée');
    });
  });
});