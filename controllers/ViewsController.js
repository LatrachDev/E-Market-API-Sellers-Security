const View = require('../models/Views');
class ViewsController {
    createView = async (req, res) => {
        try {
            const view = await View.findOne({
                userId: req.user.id,
                productId: req.params.id
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
                productId: req.params.id,
                userId: req.user.id ? req.user.id : "68ee56802f467093eeb35ca2"
            });
            res.status(201).json({
                status: "succes",
                data: newView
            });

        }
        catch (err) {
            res.status(500).json({ message: err.errors });
        }
    }
    getAllViews = async (req, res) => {
        try {
            allViews=await View.find({productId:req.params.id});
            if(!allViews){

            }
            res.status(500).json({status:500,
                message:"all  views for this product ",
                data:allViews,
            })

        }
        catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
    updateUserView=async(req,res)=>{
        try{

        }
        catch(err){
            res.status(500).json({ message: err.message });  
        }
    }



















}
module.exports = ViewsController;