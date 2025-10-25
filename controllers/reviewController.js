const Review = require('../models/review');
const Order = require('../models/Order');
const { findOne } = require('../models/products');
const mongoose = require('mongoose');

class ViewsController {
  createreView = async (req, res) => {
    try {
      const userId = req.user._id;
      console.log(userId);

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

      const existingreView = await Review.findOne({
        userId: userId,
        productId: productId
      });

      if (existingreView) {
        return res.status(409).json({
          message: "Vous avez déjà laissé un avis pour ce produit",
          status: "409"
        });
      }

      const newreView = await Review.create({
        rating: req.body.rating,
        comment: req.body.comment,
        productId: productId,
        userId: userId
      });

      return res.status(201).json({
        status: "success",
        statusCode: 201,
        data: newreView
      });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };

  getAllreViews = async (req, res) => {
    console.log("productId", req.params.productId);
    try {
      const allreViews = await Review.find({
        productId: req.params.productId,
        deletedAt: null
      });

      if (allreViews.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "No reviews found for this product"
        });
      }

      return res.status(200).json({
        status: 200,
        message: "All views for this product",
        data: allreViews,
        count: allreViews.length
      });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };

  updateUsereView = async (req, res) => {
    const userId = req.user._id ;
    console.log("req.params", req.params);
    try {
      const updated = await Review.findOneAndUpdate(
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
          message: "Vous ne pouvez pas modifier le commentaire d'un autre utilisateur."
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Votre avis a été mis à jour avec succès.",
        data: updated
      });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };

  updatereViews = async (req, res) => {
    const reviewId = req.params.id;
    try {
      const reViewUpdate = await Review.findOneAndUpdate(
        { _id: reviewId },
        { rating: req.body.rating, comment: req.body.comment },
        { new: true }
      );

      if (!reViewUpdate) {
        return res.status(404).json({
          status: 404,
          message: " view not found"  
        });
      }

      return res.status(200).json({
        status: 200,
        data: reViewUpdate
      });

    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: err.message
      });
    }
  }

  deleteUsereView = async (req, res) => {
    const where = {
      _id: req.params.id,
      productId: req.params.productId,
      userId: req.user._id
    };
    console.log("test where ", where);

    try {
      const review = await Review.findOne(where);

      if (!review) {
        return res.status(403).json({
          status: 403,
          message: "Pas accès pour supprimer la vue d'un autre utilisateur"
        });
      }

      if (review.deletedAt) {
        return res.status(400).json({
          status: 400,
          message: "Déjà supprimée"
        });
      }

      review.deletedAt = new Date();
      await review.save();

      return res.status(200).json({
        status: 200,
        message: "View supprimée (soft delete) avec succès",
        data: review
      });

    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: err.message
      });
    }
  };

  deletereViews = async (req, res) => {
    try {
      const review = await Review.findById({ _id: req.params.id });

      if (!review) {
        return res.status(404).json({
          status: 404,
          message: "view not found " 
        });
      }

      if (review.deletedAt) {
        return res.status(400).json({
          status: 400,
          message: "Déjà supprimée"
        });
      }

      review.deletedAt = new Date();
      await review.save();

      return res.status(200).json({
        status: 200,
        message: " View supprimée (soft delete) avec succès", 
        data: review
      });

    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: err.message
      });
    }
  }
}

module.exports = ViewsController;