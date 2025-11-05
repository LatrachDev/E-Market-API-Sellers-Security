const { expect } = require("chai");
const sinon = require("sinon");

const {
  getProducts,
  getOneProduct,
  createProduct,
  editProduct,
  deleteProduct,
  activateProduct,
  deactivationProduct,
} = require("../controllers/productController");
const Products = require("../models/products");
const Category = require("../models/categories");
const ImageService = require("../services/ImageService");
const NotificationEmitter = require("../events/notificationEmitter");

describe("Product Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { _id: "seller123" },
      body: {},
      params: {},
      query: {},
      files: [],
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  // ✅ TEST: getProducts
  describe("getProducts", () => {
    it("should return products with default pagination", async () => {
      const mockProducts = [
        { _id: "prod1", title: "Product 1", price: 100 },
        { _id: "prod2", title: "Product 2", price: 200 },
      ];
      const mockQuery = {
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().resolves(mockProducts),
      };

      sinon.stub(Products, "find").returns(mockQuery);
      sinon.stub(Products, "countDocuments").resolves(2);

      await getProducts(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.true;
      expect(response.data).to.deep.equal(mockProducts);
      expect(response.meta.total).to.equal(2);
      expect(response.meta.page).to.equal(1);
      expect(response.meta.limit).to.equal(12);
    });

    it("should filter products by category", async () => {
      req.query = { category: "cat123" };
      const mockProducts = [{ _id: "prod1", title: "Product 1", categories: ["cat123"] }];
      const mockQuery = {
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().resolves(mockProducts),
      };

      sinon.stub(Products, "find").returns(mockQuery);
      sinon.stub(Products, "countDocuments").resolves(1);

      await getProducts(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.true;
      expect(response.data).to.deep.equal(mockProducts);
    });

    it("should filter products by price range", async () => {
      req.query = { minPrice: 50, maxPrice: 150 };
      const mockProducts = [{ _id: "prod1", title: "Product 1", price: 100 }];
      const mockQuery = {
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().resolves(mockProducts),
      };

      sinon.stub(Products, "find").returns(mockQuery);
      sinon.stub(Products, "countDocuments").resolves(1);

      await getProducts(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.true;
    });

    it("should search products by keyword", async () => {
      req.query = { q: "laptop" };
      const mockProducts = [{ _id: "prod1", title: "Laptop Pro", price: 1000 }];
      const mockQuery = {
        select: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().resolves(mockProducts),
      };

      sinon.stub(Products, "find").returns(mockQuery);
      sinon.stub(Products, "countDocuments").resolves(1);

      await getProducts(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.true;
    });

    it("should sort products by popularity using aggregation", async () => {
      req.query = { sort: "popularity" };
      const mockAggResult = [{
        data: [{ _id: "prod1", title: "Product 1", reviewCount: 10 }],
        meta: [{ total: 1 }],
      }];

      sinon.stub(Products, "aggregate").resolves(mockAggResult);

      await getProducts(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.true;
      expect(response.data).to.deep.equal(mockAggResult[0].data);
    });

    it("should handle pagination correctly", async () => {
      req.query = { page: 2, limit: 5 };
      const mockProducts = [];
      const mockQuery = {
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().resolves(mockProducts),
      };

      sinon.stub(Products, "find").returns(mockQuery);
      sinon.stub(Products, "countDocuments").resolves(10);

      await getProducts(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.meta.page).to.equal(2);
      expect(response.meta.limit).to.equal(5);
      expect(response.meta.totalPages).to.equal(2);
    });

    it("should handle errors and call next", async () => {
      const error = new Error("Database error");
      sinon.stub(Products, "find").throws(error);

      await getProducts(req, res, next);

      expect(next.calledWith(error)).to.be.true;
    });
  });

  // ✅ TEST: getOneProduct
  describe("getOneProduct", () => {
    it("should return a product by id", async () => {
      req.params.id = "prod123";
      const mockProduct = {
        _id: "prod123",
        title: "Product 1",
        price: 100,
        description: "Test product",
      };

      sinon.stub(Products, "findById").resolves(mockProduct);

      await getOneProduct(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.true;
      expect(response.data.product).to.deep.equal(mockProduct);
    });

    it("should return 404 if product not found", async () => {
      req.params.id = "nonexistent";
      sinon.stub(Products, "findById").resolves(null);

      await getOneProduct(req, res, next);

      expect(res.status.calledWith(404)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.false;
      expect(response.message).to.equal("product not found");
    });

    it("should handle errors and call next", async () => {
      req.params.id = "prod123";
      const error = new Error("Database error");
      sinon.stub(Products, "findById").rejects(error);

      await getOneProduct(req, res, next);

      expect(next.calledWith(error)).to.be.true;
    });
  });

  // ✅ TEST: createProduct
  describe("createProduct", () => {
    it("should create a product successfully", async () => {
      req.body = {
        title: "New Product",
        description: "Product description",
        price: 100,
        stock: 50,
        categories: ["cat123"],
      };
      req.files = [];

      const mockCategories = [{ _id: "cat123", name: "Category 1" }];
      const mockProduct = {
        _id: "prod123",
        ...req.body,
        seller: req.user._id,
        images: [],
        isActive: true,
      };

      sinon.stub(Products, "findOne").resolves(null);
      sinon.stub(Category, "find").resolves(mockCategories);
      sinon.stub(Products, "create").resolves(mockProduct);
      sinon.stub(NotificationEmitter, "emit");

      await createProduct(req, res, next);

      expect(res.status.calledWith(201)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.true;
      expect(response.message).to.equal("Product created successfully");
      expect(response.data.product).to.deep.equal(mockProduct);
    });

    it("should create a product with images", async () => {
      req.body = {
        title: "New Product",
        description: "Product description",
        price: 100,
        stock: 50,
        categories: ["cat123"],
      };
      req.files = [
        { originalname: "image1.jpg", buffer: Buffer.from("test") },
        { originalname: "image2.jpg", buffer: Buffer.from("test") },
      ];

      const mockProcessedImages = [
        { original: { url: "/uploads/products/original/image1.jpg" } },
        { original: { url: "/uploads/products/original/image2.jpg" } },
      ];
      const mockCategories = [{ _id: "cat123", name: "Category 1" }];
      const mockProduct = {
        _id: "prod123",
        ...req.body,
        seller: req.user._id,
        images: mockProcessedImages,
        isActive: true,
      };

      sinon.stub(Products, "findOne").resolves(null);
      sinon.stub(ImageService, "processMultipleImages").resolves(mockProcessedImages);
      sinon.stub(Category, "find").resolves(mockCategories);
      sinon.stub(Products, "create").resolves(mockProduct);
      sinon.stub(NotificationEmitter, "emit");

      await createProduct(req, res, next);

      expect(res.status.calledWith(201)).to.be.true;
      expect(ImageService.processMultipleImages.calledOnce).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.true;
    });

    it("should return 400 if product already exists", async () => {
      req.body = { title: "Existing Product" };
      const existingProduct = { _id: "prod123", title: "Existing Product" };

      sinon.stub(Products, "findOne").resolves(existingProduct);

      await createProduct(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.message).to.equal("Product already exists");
    });

    it("should return 404 if categories not found", async () => {
      req.body = {
        title: "New Product",
        categories: ["cat123", "cat456"],
      };

      sinon.stub(Products, "findOne").resolves(null);
      sinon.stub(Category, "find").resolves([{ _id: "cat123" }]); // Only one category found

      await createProduct(req, res, next);

      expect(res.status.calledWith(404)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.message).to.equal("One or more categories not found");
    });

    it("should not emit notification in test environment", async () => {
      req.body = {
        title: "New Product",
        description: "Product description",
        price: 100,
        stock: 50,
        categories: ["cat123"],
      };
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "test";

      const mockCategories = [{ _id: "cat123" }];
      const mockProduct = {
        _id: "prod123",
        ...req.body,
        seller: req.user._id,
        images: [],
        isActive: true,
      };

      sinon.stub(Products, "findOne").resolves(null);
      sinon.stub(Category, "find").resolves(mockCategories);
      sinon.stub(Products, "create").resolves(mockProduct);
      sinon.stub(NotificationEmitter, "emit");

      await createProduct(req, res, next);

      expect(NotificationEmitter.emit.called).to.be.false;
      process.env.NODE_ENV = originalEnv;
    });

    it("should handle errors and call next", async () => {
      req.body = { title: "New Product" };
      const error = new Error("Database error");
      sinon.stub(Products, "findOne").rejects(error);

      await createProduct(req, res, next);

      expect(next.calledWith(error)).to.be.true;
    });
  });

  // ✅ TEST: editProduct
  describe("editProduct", () => {
    it("should update a product successfully", async () => {
      req.params.id = "prod123";
      req.body = { title: "Updated Product", price: 150 };
      req.files = [];

      const existingProduct = {
        _id: "prod123",
        title: "Original Product",
        images: [],
      };
      const updatedProduct = {
        _id: "prod123",
        ...req.body,
        images: [],
      };

      sinon.stub(Products, "findById").resolves(existingProduct);
      sinon.stub(Products, "findByIdAndUpdate").resolves(updatedProduct);

      await editProduct(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.true;
      expect(response.message).to.equal("product Updated successfully ");
      expect(response.data.product).to.deep.equal(updatedProduct);
    });

    it("should update product with new images and delete old ones", async () => {
      req.params.id = "prod123";
      req.body = { title: "Updated Product" };
      req.files = [{ originalname: "newimage.jpg", buffer: Buffer.from("test") }];

      const oldImages = [
        { original: { url: "/uploads/products/original/old1.jpg", filename: "old1.jpg" } },
      ];
      const existingProduct = {
        _id: "prod123",
        title: "Original Product",
        images: oldImages,
      };
      const newProcessedImages = [
        { original: { url: "/uploads/products/original/newimage.jpg", filename: "newimage.jpg" } },
      ];
      const updatedProduct = {
        _id: "prod123",
        ...req.body,
        images: newProcessedImages,
      };

      sinon.stub(Products, "findById").resolves(existingProduct);
      sinon.stub(ImageService, "deleteImageFiles").resolves();
      sinon.stub(ImageService, "processMultipleImages").resolves(newProcessedImages);
      sinon.stub(Products, "findByIdAndUpdate").resolves(updatedProduct);

      await editProduct(req, res, next);

      expect(ImageService.deleteImageFiles.called).to.be.true;
      expect(ImageService.processMultipleImages.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.true;
    });

    it("should return 404 if product not found", async () => {
      req.params.id = "nonexistent";
      sinon.stub(Products, "findById").resolves(null);

      await editProduct(req, res, next);

      expect(res.status.calledWith(404)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.false;
      expect(response.message).to.equal("Product not found");
    });

    it("should handle errors and call next", async () => {
      req.params.id = "prod123";
      const error = new Error("Database error");
      sinon.stub(Products, "findById").rejects(error);

      await editProduct(req, res, next);

      expect(next.calledWith(error)).to.be.true;
    });
  });

  // ✅ TEST: deleteProduct
  describe("deleteProduct", () => {
    it("should delete a product successfully", async () => {
      req.params.id = "prod123";
      const mockProduct = { _id: "prod123", title: "Product to delete" };

      sinon.stub(Products, "findByIdAndDelete").resolves(mockProduct);

      await deleteProduct(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.true;
      expect(response.message).to.equal("Product deleted successfully");
    });

    it("should return 404 if product not found", async () => {
      req.params.id = "nonexistent";
      sinon.stub(Products, "findByIdAndDelete").resolves(null);

      await deleteProduct(req, res, next);

      expect(res.status.calledWith(404)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.false;
      expect(response.message).to.equal("product not found");
    });

    it("should handle errors and call next", async () => {
      req.params.id = "prod123";
      const error = new Error("Database error");
      sinon.stub(Products, "findByIdAndDelete").rejects(error);

      await deleteProduct(req, res, next);

      expect(next.calledWith(error)).to.be.true;
    });
  });

  // ✅ TEST: activateProduct
  describe("activateProduct", () => {
    it("should activate a product successfully", async () => {
      req.params.id = "prod123";
      const mockProduct = {
        _id: "prod123",
        title: "Product",
        isActive: false,
        save: sinon.stub().resolves(),
      };

      sinon.stub(Products, "findById").resolves(mockProduct);

      await activateProduct(req, res, next);

      expect(mockProduct.isActive).to.be.true;
      expect(mockProduct.save.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.true;
      expect(response.message).to.equal("Product activated successfully");
    });

    it("should return 404 if product not found", async () => {
      req.params.id = "nonexistent";
      sinon.stub(Products, "findById").resolves(null);

      await activateProduct(req, res, next);

      expect(res.status.calledWith(404)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.message).to.equal("Product not found");
    });

    it("should handle errors and call next", async () => {
      req.params.id = "prod123";
      const error = new Error("Database error");
      sinon.stub(Products, "findById").rejects(error);

      await activateProduct(req, res, next);

      expect(next.calledWith(error)).to.be.true;
    });
  });

  // ✅ TEST: deactivationProduct
  describe("deactivationProduct", () => {
    it("should deactivate a product successfully", async () => {
      req.params.id = "prod123";
      const mockProduct = {
        _id: "prod123",
        title: "Product",
        isActive: true,
        save: sinon.stub().resolves(),
      };

      sinon.stub(Products, "findById").resolves(mockProduct);

      await deactivationProduct(req, res, next);

      expect(mockProduct.isActive).to.be.false;
      expect(mockProduct.save.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.true;
      expect(response.message).to.equal("Product deactivated successfully");
    });

    it("should return 404 if product not found", async () => {
      req.params.id = "nonexistent";
      sinon.stub(Products, "findById").resolves(null);

      await deactivationProduct(req, res, next);

      expect(res.status.calledWith(404)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.false;
      expect(response.message).to.equal("product not found");
    });

    it("should handle errors and call next", async () => {
      req.params.id = "prod123";
      const error = new Error("Database error");
      sinon.stub(Products, "findById").rejects(error);

      await deactivationProduct(req, res, next);

      expect(next.calledWith(error)).to.be.true;
    });
  });
});

