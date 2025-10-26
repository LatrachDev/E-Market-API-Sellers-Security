const chai = require("chai");
const sinon = require("sinon");
const expect = chai.expect;

const Cart = require("../models/Cart");
const Product = require("../models/products");
const {
  addToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
} = require("../controllers/cartController");

describe("Cart Controller - Integration Tests", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, user: { id: "68ee92632cc5727f5c6d0f01" } };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  // ===============================================================
  // 🛒 TEST: addToCart
  // ===============================================================
  describe("addToCart", () => {
    it("ajoute un produit au panier avec succès", async () => {
      req.body = { productId: "prod123", quantity: 2 };

      const mockProduct = { _id: "prod123", price: 50, stock: 10 };
      sinon.stub(Product, "findById").resolves(mockProduct);

      const mockCart = {
        user: req.user.id,
        items: [],
        total: 0,
        save: sinon.stub().resolves(),
      };
      sinon.stub(Cart, "findOne").resolves(mockCart);

      await addToCart(req, res);

      expect(Product.findById.calledOnce).to.be.true;
      expect(mockCart.save.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property(
        "message",
        "Produit ajouté au panier avec succès"
      );
    });

    it("renvoie une erreur si le produit est introuvable", async () => {
      req.body = { productId: "prod123", quantity: 1 };
      sinon.stub(Product, "findById").resolves(null);

      await addToCart(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property(
        "message",
        "Produit introuvable"
      );
    });

    it("renvoie une erreur si le stock est insuffisant", async () => {
      req.body = { productId: "prod123", quantity: 5 };
      sinon.stub(Product, "findById").resolves({ stock: 2 });

      await addToCart(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property(
        "message",
        "Stock insuffisant"
      );
    });
  });

  // ===============================================================
  // 🛍️ TEST: getCart
  // ===============================================================
  describe("getCart", () => {
    it("renvoie le panier de l'utilisateur avec succès", async () => {
      const mockCart = {
        user: req.user.id,
        items: [{ product: "prod1", quantity: 2 }],
      };

      const populateStub = sinon.stub().resolves(mockCart);
      sinon.stub(Cart, "findOne").returns({ populate: populateStub });

      await getCart(req, res);

      expect(Cart.findOne.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property("cart");
    });

    it("renvoie une erreur si le panier est introuvable", async () => {
      const populateStub = sinon.stub().resolves(null);
      sinon.stub(Cart, "findOne").returns({ populate: populateStub });

      await getCart(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property(
        "message",
        "Panier introuvable"
      );
    });
  });

  // ===============================================================
  // 🔁 TEST: updateCartItem
  // ===============================================================
  describe("updateCartItem", () => {
    it("met à jour la quantité d'un produit dans le panier", async () => {
      req.params.productId = "prod123";
      req.body.quantity = 5;

      const mockCart = {
        user: req.user.id,
        items: [{ product: "prod123", quantity: 1, price: 10 }],
        save: sinon.stub().resolves(),
      };
      sinon.stub(Cart, "findOne").resolves(mockCart);

      await updateCartItem(req, res);

      expect(mockCart.items[0].quantity).to.equal(5);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property(
        "message",
        "Quantité mise à jour avec succès"
      );
    });

    it("renvoie une erreur si le produit n'existe pas dans le panier", async () => {
      req.params.productId = "prod999";
      req.body.quantity = 3;

      const mockCart = {
        items: [{ product: "prod123", quantity: 2, price: 10 }],
      };
      sinon.stub(Cart, "findOne").resolves(mockCart);

      await updateCartItem(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property(
        "message",
        "Produit introuvable dans le panier"
      );
    });
  });

  // ===============================================================
  // ❌ TEST: deleteCartItem
  // ===============================================================
  describe("deleteCartItem", () => {
    it("supprime un produit du panier avec succès", async () => {
      req.params.productId = "prod123";

      const mockCart = {
        items: [{ product: "prod123", quantity: 1, price: 10 }],
        save: sinon.stub().resolves(),
      };
      sinon.stub(Cart, "findOne").resolves(mockCart);

      await deleteCartItem(req, res);

      expect(mockCart.items.length).to.equal(0);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property(
        "message",
        "Produit supprimé du panier avec succès"
      );
    });

    it("renvoie une erreur si le panier est introuvable", async () => {
      sinon.stub(Cart, "findOne").resolves(null);
      req.params.productId = "prod123";

      await deleteCartItem(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property(
        "message",
        "Panier introuvable"
      );
    });
  });
});
