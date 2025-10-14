const View = require('../models/Views');
class ViewsController {
    createView = async (req, res) => {
      
        try {
            const view = await View.findOne({
              userId: req.user?.id || "68ee92632cc5727f5c6d0f01",

                productId: req.params.productId
            });
            if (view) {
                return res.status(409).json({
                    message: "View already created for this product",
                    status: "409"
                });

            }
            const newView = await View.create({
                rating: req.body.rating,
                comment: req.body.comment,
                productId: req.params.productId,
               userId: req.user?req.user.id:"68ee92632cc5727f5c6d0f01"

            });
            res.status(201).json({
                status: "succes",
                data: newView
            });

        }
        catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
   getAllViews = async (req, res) => {
  console.log("productId", req.params.productId);
  try {
    const allViews = await View.find({ productId: req.params.productId });

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
      count:allViews.length
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

   updateUserView = async (req, res) => {
  const userId = req.user ? req.user.id : "68ee92632cc5727f5c6d0f01";
 console.log("req.params",req.params);
  try {
   
    const updated = await View.findOneAndUpdate(
      {
        _id: req.params.id,      
        userId: userId  ,
        productId:req.params.productId         
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



















}
module.exports = ViewsController;