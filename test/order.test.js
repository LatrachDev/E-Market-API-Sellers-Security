const { expect } = require("chai");
const sinon = require("sinon");

const { createOrder, getOrders, simulatePaymentController, updateStockAfterOrder } = require("../controllers/orderController");
const Orders = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/products");

describe("Order Controller", () => {
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

  // ✅ TEST: createOrder
  describe("createOrder", () => {
    it("crée une commande avec succès", async () => {
      const mockCart = {
        user: "user123",
        items: [
          {
            product: { _id: "prod1", seller: "seller1", title: "Produit 1", price: 100 },
            quantity: 2,
            price: 100
          }
        ],
        total: 200,
        save: sinon.stub().resolves()
      };

      const mockOrder = { _id: "order123", save: sinon.stub().resolves() };

      sinon.stub(Cart, "findOne").returns({
        populate: sinon.stub().resolves(mockCart)
      });
      sinon.stub(Orders.prototype, "save").resolves(mockOrder);

      await createOrder(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.status).to.equal("success");
      expect(response.message).to.equal("Commande créée avec succès");
    });

    it("renvoie une erreur si le panier est vide", async () => {
      const mockCart = { user: "user123", items: [] };

      sinon.stub(Cart, "findOne").returns({
        populate: sinon.stub().resolves(mockCart)
      });

      await createOrder(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.message).to.equal("Le panier est vide");
    });

    it("renvoie une erreur si certains produits du panier n'existent plus", async () => {
      const mockCart = {
        user: "user123",
        items: [{ product: null, quantity: 1, price: 100 }]
      };

      sinon.stub(Cart, "findOne").returns({
        populate: sinon.stub().resolves(mockCart)
      });

      await createOrder(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.message).to.equal("Certains produits du panier n'existent plus.");
    });
  });

  // ✅ TEST: getOrders
  describe("getOrders", () => {
    it("renvoie les commandes de l'utilisateur avec succès", async () => {
      const mockOrders = [{ _id: "order1" }, { _id: "order2" }];

      sinon.stub(Orders, "find").returns({
        populate: sinon.stub().resolves(mockOrders)
      });

      await getOrders(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.status).to.equal("success");
      expect(response.orders).to.deep.equal(mockOrders);
    });
  });

  // ✅ TEST: simulatePaymentController
  describe("simulatePaymentController", () => {
    it("simule un paiement avec succès", async () => {
      req.body = { orderId: "order123" };
      const mockOrder = { _id: "order123", save: sinon.stub().resolves() };

      sinon.stub(Orders, "findById").resolves(mockOrder);

      await simulatePaymentController(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.status).to.equal("success");
      expect(response.message).to.equal("Paiement simulé avec succès");
    });

    it("renvoie une erreur si la commande est introuvable", async () => {
      req.body = { orderId: "order123" };

      sinon.stub(Orders, "findById").resolves(null);

      await simulatePaymentController(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.message).to.equal("Commande introuvable");
    });
  });

  // ✅ TEST: updateStockAfterOrder
  describe("updateStockAfterOrder", () => {
    it("met à jour le stock avec succès", async () => {
      req.body = { orderId: "order123" };

      const mockProduct = { title: "Produit 1", stock: 10, save: sinon.stub().resolves() };
      const mockOrder = {
        _id: "order123",
        status: "paid",
        paymentStatus: "paid",
        items: [{ product: mockProduct, quantity: 2 }]
      };

      sinon.stub(Orders, "findById").returns({
        populate: sinon.stub().resolves(mockOrder)
      });

      await updateStockAfterOrder(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.message).to.equal("Stock mis à jour avec succès après le paiement.");
    });

    it("renvoie une erreur si la commande est introuvable", async () => {
      req.body = { orderId: "order123" };

      sinon.stub(Orders, "findById").returns({
        populate: sinon.stub().resolves(null)
      });

      await updateStockAfterOrder(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.message).to.equal("Commande introuvable.");
    });

    it("renvoie une erreur si le paiement n'est pas confirmé", async () => {
      req.body = { orderId: "order123" };

      const mockOrder = { status: "pending", paymentStatus: "unpaid" };

      sinon.stub(Orders, "findById").returns({
        populate: sinon.stub().resolves(mockOrder)
      });

      await updateStockAfterOrder(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.message).to.equal("Le paiement n'est pas encore confirmé.");
    });

    it("renvoie une erreur si le stock est insuffisant", async () => {
      req.body = { orderId: "order123" };

      const mockProduct = { title: "Produit 1", stock: 1 };
      const mockOrder = {
        status: "paid",
        paymentStatus: "paid",
        items: [{ product: mockProduct, quantity: 5 }]
      };

      sinon.stub(Orders, "findById").returns({
        populate: sinon.stub().resolves(mockOrder)
      });

      await updateStockAfterOrder(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.message).to.include("n'a pas assez de stock");
    });
  });
});
