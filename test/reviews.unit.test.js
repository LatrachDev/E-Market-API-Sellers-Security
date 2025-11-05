const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')

const User = require('../models/user')
const Product = require('../models/products')
const Order = require('../models/Order')
const Review = require('../models/review')
const ViewsController = require('../controllers/reviewController')

describe('ViewsController', () => {
  let viewsController
  let req, res

  beforeEach(() => {
    viewsController = new ViewsController()

    req = {
      user: { id: 'user123' },
      params: {},
      body: {},
    }

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    }
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('createreView', () => {
    it('devrait créer un avis avec succès', async () => {
      req.params.productId = 'product123'
      req.body = { rating: 5, comment: 'Excellent produit' }

      const mockOrder = {
        user: 'user123',
        status: 'delivered',
        items: [{ product: 'product123' }],
      }

      const mockReview = {
        _id: 'review123',
        rating: 5,
        comment: 'Excellent produit',
        productId: 'product123',
        userId: 'user123',
      }

      sinon.stub(Order, 'findOne').resolves(mockOrder)
      sinon.stub(Review, 'findOne').resolves(null)
      sinon.stub(Review, 'create').resolves(mockReview)

      await viewsController.createreView(req, res)

      expect(res.status.calledWith(201)).to.be.true
      expect(
        res.json.calledWith({
          status: 'success',
          statusCode: 201,
          data: mockReview,
        })
      ).to.be.true
    })

    it("devrait retourner 403 si l'utilisateur n'a pas acheté le produit", async () => {
      req.params.productId = 'product123'
      req.body = { rating: 5, comment: 'Test' }

      sinon.stub(Order, 'findOne').resolves(null)

      await viewsController.createreView(req, res)

      expect(res.status.calledWith(403)).to.be.true
      expect(
        res.json.calledWith({
          message:
            "Vous ne pouvez pas laisser un avis avant d'avoir acheté ce produit",
          status: '403',
        })
      ).to.be.true
    })

    it("devrait retourner 409 si l'utilisateur a déjà laissé un avis", async () => {
      req.params.productId = 'product123'
      req.body = { rating: 5, comment: 'Test' }

      const mockOrder = {
        user: 'user123',
        status: 'delivered',
        items: [{ product: 'product123' }],
      }

      const existingReview = {
        _id: 'review456',
        userId: 'user123',
        productId: 'product123',
      }

      sinon.stub(Order, 'findOne').resolves(mockOrder)
      sinon.stub(Review, 'findOne').resolves(existingReview)

      await viewsController.createreView(req, res)

      expect(res.status.calledWith(409)).to.be.true
      expect(
        res.json.calledWith({
          message: 'Vous avez déjà laissé un avis pour ce produit',
          status: '409',
        })
      ).to.be.true
    })

    it("devrait retourner 500 en cas d'erreur serveur", async () => {
      req.params.productId = 'product123'
      req.body = { rating: 5, comment: 'Test' }

      sinon.stub(Order, 'findOne').rejects(new Error('Database error'))

      await viewsController.createreView(req, res)

      expect(res.status.calledWith(500)).to.be.true
      expect(res.json.calledWith({ message: 'Database error' })).to.be.true
    })
  })

  describe('getAllreViews', () => {
    it('devrait retourner tous les avis pour un produit', async () => {
      req.params.productId = 'product123'

      const mockReviews = [
        {
          _id: 'review1',
          rating: 5,
          comment: 'Super',
          productId: 'product123',
        },
        { _id: 'review2', rating: 4, comment: 'Bien', productId: 'product123' },
      ]

      sinon.stub(Review, 'find').resolves(mockReviews)

      await viewsController.getAllreViews(req, res)

      expect(res.status.calledWith(200)).to.be.true
      expect(
        res.json.calledWith({
          status: 200,
          message: 'All views for this product',
          data: mockReviews,
          count: 2,
        })
      ).to.be.true
    })

    it("devrait retourner 404 si aucun avis n'est trouvé", async () => {
      req.params.productId = 'product123'

      sinon.stub(Review, 'find').resolves([])

      await viewsController.getAllreViews(req, res)

      expect(res.status.calledWith(404)).to.be.true
      expect(
        res.json.calledWith({
          status: 404,
          message: 'No reviews found for this product',
        })
      ).to.be.true
    })

    it("devrait retourner 500 en cas d'erreur", async () => {
      req.params.productId = 'product123'

      sinon.stub(Review, 'find').rejects(new Error('Database error'))

      await viewsController.getAllreViews(req, res)

      expect(res.status.calledWith(500)).to.be.true
      expect(res.json.calledWith({ message: 'Database error' })).to.be.true
    })
  })

  describe('updateUsereView', () => {
    it("devrait mettre à jour l'avis de l'utilisateur", async () => {
      req.params = { id: 'review123', productId: 'product123' }
      req.body = { rating: 4, comment: 'Mis à jour' }

      const updatedReview = {
        _id: 'review123',
        rating: 4,
        comment: 'Mis à jour',
        userId: 'user123',
        productId: 'product123',
      }

      sinon.stub(Review, 'findOneAndUpdate').resolves(updatedReview)

      await viewsController.updateUsereView(req, res)

      expect(res.status.calledWith(200)).to.be.true
      expect(
        res.json.calledWith({
          status: 200,
          message: 'Votre avis a été mis à jour avec succès.',
          data: updatedReview,
        })
      ).to.be.true
    })

    it("devrait retourner 403 si l'utilisateur essaie de modifier l'avis d'un autre", async () => {
      req.params = { id: 'review123', productId: 'product123' }
      req.body = { rating: 4, comment: 'Test' }

      sinon.stub(Review, 'findOneAndUpdate').resolves(null)

      await viewsController.updateUsereView(req, res)

      expect(res.status.calledWith(403)).to.be.true
      expect(
        res.json.calledWith({
          status: 403,
          message:
            "Vous ne pouvez pas modifier le commentaire d'un autre utilisateur.",
        })
      ).to.be.true
    })

    it("devrait retourner 500 en cas d'erreur", async () => {
      req.params = { id: 'review123', productId: 'product123' }
      req.body = { rating: 4, comment: 'Test' }

      sinon.stub(Review, 'findOneAndUpdate').rejects(new Error('Update error'))

      await viewsController.updateUsereView(req, res)

      expect(res.status.calledWith(500)).to.be.true
      expect(res.json.calledWith({ message: 'Update error' })).to.be.true
    })
  })

  describe('updatereViews', () => {
    it('devrait mettre à jour un avis (admin)', async () => {
      req.params.id = 'review123'
      req.body = { rating: 3, comment: 'Modifié par admin' }

      const updatedReview = {
        _id: 'review123',
        rating: 3,
        comment: 'Modifié par admin',
      }

      sinon.stub(Review, 'findOneAndUpdate').resolves(updatedReview)

      await viewsController.updatereViews(req, res)

      expect(res.status.calledWith(200)).to.be.true
      expect(
        res.json.calledWith({
          status: 200,
          data: updatedReview,
        })
      ).to.be.true
    })

    it("devrait retourner 404 si l'avis n'existe pas", async () => {
      req.params.id = 'review123'
      req.body = { rating: 3, comment: 'Test' }

      sinon.stub(Review, 'findOneAndUpdate').resolves(null)

      await viewsController.updatereViews(req, res)

      expect(res.status.calledWith(404)).to.be.true
      expect(
        res.json.calledWith({
          status: 404,
          message: ' view not found',
        })
      ).to.be.true
    })
  })

  describe('deleteUsereView', () => {
    it("devrait supprimer (soft delete) l'avis de l'utilisateur", async () => {
      req.params = { id: 'review123', productId: 'product123' }

      const mockReview = {
        _id: 'review123',
        userId: 'user123',
        productId: 'product123',
        deletedAt: null,
        save: sinon.stub().resolves(),
      }

      sinon.stub(Review, 'findOne').resolves(mockReview)

      await viewsController.deleteUsereView(req, res)

      expect(mockReview.deletedAt).to.not.be.null
      expect(mockReview.save.calledOnce).to.be.true
      expect(res.status.calledWith(200)).to.be.true
      expect(
        res.json.calledWith({
          status: 200,
          message: 'View supprimée (soft delete) avec succès',
          data: mockReview,
        })
      ).to.be.true
    })

    it("devrait retourner 403 si l'utilisateur n'a pas accès", async () => {
      req.params = { id: 'review123', productId: 'product123' }

      sinon.stub(Review, 'findOne').resolves(null)

      await viewsController.deleteUsereView(req, res)

      expect(res.status.calledWith(403)).to.be.true
      expect(
        res.json.calledWith({
          status: 403,
          message: "Pas accès pour supprimer la vue d'un autre utilisateur",
        })
      ).to.be.true
    })

    it("devrait retourner 400 si l'avis est déjà supprimé", async () => {
      req.params = { id: 'review123', productId: 'product123' }

      const mockReview = {
        _id: 'review123',
        userId: 'user123',
        productId: 'product123',
        deletedAt: new Date(),
      }

      sinon.stub(Review, 'findOne').resolves(mockReview)

      await viewsController.deleteUsereView(req, res)

      expect(res.status.calledWith(400)).to.be.true
      expect(
        res.json.calledWith({
          status: 400,
          message: 'Déjà supprimée',
        })
      ).to.be.true
    })
  })

  describe('deletereViews', () => {
    it('devrait supprimer (soft delete) un avis (admin)', async () => {
      req.params.id = 'review123'

      const mockReview = {
        _id: 'review123',
        deletedAt: null,
        save: sinon.stub().resolves(),
      }

      sinon.stub(Review, 'findById').resolves(mockReview)

      await viewsController.deletereViews(req, res)

      expect(mockReview.deletedAt).to.not.be.null
      expect(mockReview.save.calledOnce).to.be.true
      expect(res.status.calledWith(200)).to.be.true
      expect(
        res.json.calledWith({
          status: 200,
          message: ' View supprimée (soft delete) avec succès',
          data: mockReview,
        })
      ).to.be.true
    })

    it("devrait retourner 404 si l'avis n'existe pas", async () => {
      req.params.id = 'review123'

      sinon.stub(Review, 'findById').resolves(null)

      await viewsController.deletereViews(req, res)

      expect(res.status.calledWith(404)).to.be.true
      expect(
        res.json.calledWith({
          status: 404,
          message: 'view not found ',
        })
      ).to.be.true
    })

    it("devrait retourner 400 si l'avis est déjà supprimé", async () => {
      req.params.id = 'review123'

      const mockReview = {
        _id: 'review123',
        deletedAt: new Date(),
      }

      sinon.stub(Review, 'findById').resolves(mockReview)

      await viewsController.deletereViews(req, res)

      expect(res.status.calledWith(400)).to.be.true
      expect(
        res.json.calledWith({
          status: 400,
          message: 'Déjà supprimée',
        })
      ).to.be.true
    })
  })
})
