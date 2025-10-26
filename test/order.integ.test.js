const chai = require("chai");
const sinon = require("sinon");
const expect = chai.expect;

const Orders = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/products");

const {
  createOrder,
  getOrders,
  simulatePaymentController,
  updateStockAfterOrder,
} = require("../controllers/orderController");

describe("Order Controller - Integration Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: "68ee92632cc5727f5c6d0f01" },
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  // ===============================================================
  // 🛒 createOrder
  // ===============================================================
  describe("createOrder", () => {
    it("crée une commande avec succès et vide le panier", async () => {
      const mockCart = {
        user: req.user.id,
        items: [
          {
            product: { _id: "prod123", seller: "seller1", title: "Produit A" },
            quantity: 2,
            price: 50,
          },
        ],
        total: 100,
        save: sinon.stub().resolves(),
      };

      const orderSaveStub = sinon.stub().resolves();
      sinon.stub(Cart, "findOne").returns({ populate: sinon.stub().resolves(mockCart) });
      sinon.stub(Orders.prototype, "save").callsFake(orderSaveStub);

      await createOrder(req, res);

      expect(Cart.findOne.calledOnce).to.be.true;
      expect(orderSaveStub.calledOnce).to.be.true;
      expect(mockCart.items.length).to.equal(0);
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property(
        "message",
        "Commande créée avec succès"
      );
    });

    it("renvoie une erreur si le panier est vide", async () => {
      const mockCart = { items: [] };
      sinon.stub(Cart, "findOne").returns({ populate: sinon.stub().resolves(mockCart) });

      await createOrder(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property(
        "message",
        "Le panier est vide"
      );
    });

    it("renvoie une erreur si les produits du panier n'existent plus", async () => {
      const mockCart = {
        items: [{ product: null, quantity: 1, price: 20 }],
        total: 20,
      };
      sinon.stub(Cart, "findOne").returns({ populate: sinon.stub().resolves(mockCart) });

      await createOrder(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property(
        "message",
        "Certains produits du panier n'existent plus."
      );
    });
  });

  // ===============================================================
  // 📦 getOrders
  // ===============================================================
  describe("getOrders", () => {
    it("renvoie la liste des commandes de l'utilisateur", async () => {
      const mockOrders = [{ id: "order1" }, { id: "order2" }];
      sinon.stub(Orders, "find").returns({ populate: sinon.stub().resolves(mockOrders) });

      await getOrders(req, res, () => {});

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property("orders").that.is.an("array");
    });
  });

  // ===============================================================
  // 💳 simulatePaymentController
  // ===============================================================
  describe("simulatePaymentController", () => {
    it("simule un paiement avec succès et met à jour la commande", async () => {
      req.body = { orderId: "order123" };
      const mockOrder = {
        _id: "order123",
        status: "pending",
        paymentStatus: "unpaid",
        save: sinon.stub().resolves(),
      };

      sinon.stub(Orders, "findById").resolves(mockOrder);

      await simulatePaymentController(req, res);

      expect(mockOrder.status).to.equal("paid");
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property(
        "message",
        "Paiement simulé avec succès"
      );
    });

    it("renvoie une erreur si la commande n'existe pas", async () => {
      req.body = { orderId: "order123" };
      sinon.stub(Orders, "findById").resolves(null);

      await simulatePaymentController(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property(
        "message",
        "Commande introuvable"
      );
    });
  });

  // ===============================================================
  // 🏪 updateStockAfterOrder
  // ===============================================================
  describe("updateStockAfterOrder", () => {
    it("met à jour le stock après une commande payée", async () => {
      req.body = { orderId: "order123" };

      const mockProduct = { _id: "prod1", stock: 10, title: "Produit A", save: sinon.stub().resolves() };
      const mockOrder = {
        _id: "order123",
        status: "paid",
        paymentStatus: "paid",
        items: [{ product: mockProduct, quantity: 2 }],
      };

      sinon.stub(Orders, "findById").returns({ populate: sinon.stub().resolves(mockOrder) });

      await updateStockAfterOrder(req, res);

      expect(mockProduct.stock).to.equal(8);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property(
        "message",
        "Stock mis à jour avec succès après le paiement."
      );
    });

    it("renvoie une erreur si la commande n'est pas payée", async () => {
      req.body = { orderId: "order123" };

      const mockOrder = { status: "pending", paymentStatus: "unpaid", items: [] };
      sinon.stub(Orders, "findById").returns({ populate: sinon.stub().resolves(mockOrder) });

      await updateStockAfterOrder(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property(
        "message",
        "Le paiement n'est pas encore confirmé."
      );
    });

    it("renvoie une erreur si le stock est insuffisant", async () => {
      req.body = { orderId: "order123" };

      const mockProduct = { title: "Produit B", stock: 1, save: sinon.stub().resolves() };
      const mockOrder = {
        status: "paid",
        paymentStatus: "paid",
        items: [{ product: mockProduct, quantity: 3 }],
      };

      sinon.stub(Orders, "findById").returns({ populate: sinon.stub().resolves(mockOrder) });

      await updateStockAfterOrder(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.include("n'a pas assez de stock");
    });
  });
});
