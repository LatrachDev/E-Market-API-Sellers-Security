const { expect } = require("chai");
const sinon = require("sinon");

const { addToCart, getCart, updateCartItem, deleteCartItem } = require("../controllers/cartController");
const Cart = require("../models/Cart");
const Product = require("../models/products");

describe("Cart Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: "user123" },
      body: {},
      params: {}
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  // ✅ TEST: addToCart
  describe("addToCart", () => {
    const mockProduct = { _id: "prod123", price: 100, stock: 10 };
    const mockCart = { user: "user123", items: [], save: sinon.stub().resolves(), total: 0 };

    beforeEach(() => {
      req.body = { productId: "prod123", quantity: 2 };
    });

    it("ajoute un produit au panier avec succès", async () => {
      sinon.stub(Product, "findById").resolves(mockProduct);
      sinon.stub(Cart, "findOne").resolves(mockCart);

      await addToCart(req, res);

      expect(Product.findById.calledOnce).to.be.true;
      expect(Cart.findOne.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;

      const response = res.json.firstCall.args[0];
      expect(response.message).to.equal("Produit ajouté au panier avec succès");
    });

    it("renvoie une erreur si le produit est introuvable", async () => {
      sinon.stub(Product, "findById").resolves(null);

      await addToCart(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.message).to.equal("Produit introuvable");
    });
  });

  // ✅ TEST: getCart
  describe("getCart", () => {
    it("renvoie le panier de l'utilisateur avec succès", async () => {
      const mockCart = { user: "user123", items: [{ product: "prod1", quantity: 2 }] };

      const findOneStub = sinon.stub(Cart, "findOne").returns({
        populate: sinon.stub().resolves(mockCart)
      });

      await getCart(req, res);

      expect(findOneStub.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.equal({ cart: mockCart });
    });

    it("renvoie une erreur si le panier est introuvable", async () => {
      const findOneStub = sinon.stub(Cart, "findOne").returns({
        populate: sinon.stub().resolves(null)
      });

      await getCart(req, res);

      expect(findOneStub.calledOnce).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.message).to.equal("Panier introuvable");
    });
  });

  // ✅ TEST: updateCartItem
  describe("updateCartItem", () => {
    beforeEach(() => {
      req.body = { quantity: 3 };
      req.params = { productId: "prod123" };
    });

    it("met à jour la quantité d'un article avec succès", async () => {
      const mockCart = {
        user: "user123",
        items: [{ product: "prod123", quantity: 1 }],
        save: sinon.stub().resolves()
      };

      sinon.stub(Cart, "findOne").resolves(mockCart);

      await updateCartItem(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.message).to.equal("Quantité mise à jour avec succès");
    });

    it("renvoie une erreur si le produit n'est pas dans le panier", async () => {
      const mockCart = {
        user: "user123",
        items: [{ product: "autreProd", quantity: 1 }],
        save: sinon.stub().resolves()
      };

      sinon.stub(Cart, "findOne").resolves(mockCart);

      await updateCartItem(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.message).to.equal("Produit introuvable dans le panier");
    });
  });

  // ✅ TEST: deleteCartItem
  describe("deleteCartItem", () => {
    beforeEach(() => {
      req.params = { productId: "prod123" };
    });

    it("supprime un produit du panier avec succès", async () => {
      const mockCart = {
        user: "user123",
        items: [{ product: "prod123", quantity: 1 }],
        save: sinon.stub().resolves()
      };

      sinon.stub(Cart, "findOne").resolves(mockCart);

      await deleteCartItem(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.message).to.equal("Produit supprimé du panier avec succès");
    });

    it("renvoie une erreur si le produit n'existe pas dans le panier", async () => {
      const mockCart = {
        user: "user123",
        items: [{ product: "autreProd", quantity: 1 }],
        save: sinon.stub().resolves()
      };

      sinon.stub(Cart, "findOne").resolves(mockCart);

      await deleteCartItem(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.message).to.equal("Produit introuvable dans le panier");
    });
  });
});
