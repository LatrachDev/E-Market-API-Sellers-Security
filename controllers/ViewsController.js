const View = require('../models/Views');
const Order = require('../models/Order');
const { findOne } = require('../models/products');
class ViewsController {
  createView = async (req, res) => {
    try {


      const userId = req.user ? req.user.id : "68ef9c9b9deb6380ccd3d65b";
      const productId = req.params.productId;


      const order = await Order.findOne({
        user: userId,
        status: { $in: ["paid", "shipped", "delivered"] },
        items: { $elemMatch: { product: productId } }
      });

      if (!order) {
        return res.status(403).json({
          message: "Vous ne pouvez pas laisser un avis avant d'avoir acheté ce produit",
          status: "403"
        });
      }


      const existingView = await View.findOne({
        userId: userId,
        productId: productId
      });

      if (existingView) {
        return res.status(409).json({
          message: "Vous avez déjà laissé un avis pour ce produit",
          status: "409"
        });
      }


      const newView = await View.create({
        rating: req.body.rating,
        comment: req.body.comment,
        productId: productId,
        userId: userId
      });

      res.status(201).json({
        status: "success",
        data: newView
      });

    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  getAllViews = async (req, res) => {
    console.log("productId", req.params.productId);
    try {
      const allViews = await View.find({
        productId: req.params.productId, deletedAt: null

      });

      if (allViews.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "No views found for this product"
        });
      }

      res.status(200).json({
        status: 200,
        message: "All views for this product",
        data: allViews,
        count: allViews.length
      });

    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  updateUserView = async (req, res) => {
    const userId = req.user ? req.user.id : "68ee92632cc5727f5c6d0f00";
    console.log("req.params", req.params);
    try {

      const updated = await View.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: userId,
          productId: req.params.productId
        },
        {
          comment: req.body.comment,
          rating: req.body.rating
        },
        { new: true }
      );

      if (!updated) {
        return res.status(403).json({
          status: 403,
          message: "Vous ne pouvez pas modifier le commentaire d’un autre utilisateur."
        });
      }


      res.status(200).json({
        status: 200,
        message: "Votre avis a été mis à jour avec succès.",
        data: updated
      });

    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  updateViews = async (req, res) => {
    const viewId = req.params.id;
    try {
      const ViewUpdate = await View.findOneAndUpdate({ _id: viewId }, { rating: req.body.rating, comment: req.body.comment }, { new: true });

      if (ViewUpdate) {
        res.status(404).json({
          status: 404,
          message: " view not found"
        })
      }
      res.status(200).json({
        status: 200,
        data: ViewUpdate
      })


    }
    catch (err) {
      res.status(500).json({
        status: 500,
        message: err.message
      })
    }

  }
  deleteUserView = async (req, res) => {

    const where = {
      _id: req.params.id,
      productId: req.params.productId,
      userId: req.user ? req.user.id : "68ee92632cc5727f5c6d0f01"
    };
    console.log("test where ", where);

    try {
      const view = await View.findOne(where);

      if (!view) {
        return res.status(403).json({
          status: 403,
          message: "Pas accès pour supprimer la vue d’un autre utilisateur"
        });
      }

      if (view.deletedAt) {
        return res.status(400).json({
          status: 400,
          message: "Déjà supprimée"
        });
      }

      view.deletedAt = new Date();
      await view.save();

      return res.status(200).json({
        status: 200,
        message: "View supprimée (soft delete) avec succès",
        data: view
      });

    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: err.message
      });
    }
  };
  deleteViews = async (req, res) => {
    try {
      const view = await View.findById({ _id: req.params.id });
      if (!view) {
        res.status(404).json({ status: 404, message: "view not found " });
      }
      if (view.deletedAt) {
        res.status(400).json({ status: 400, message: "Déjà supprimée" });
      }
      view.deletedAt = new Date();
      await view.save();
      res.status(200).json({ status: 200, message: " View supprimée (soft delete) avec succès", data: view })
    }
    catch (err) {
      res.status(500).json({ status: 500, message: err.message });
    }

  }





















}
module.exports = ViewsController;