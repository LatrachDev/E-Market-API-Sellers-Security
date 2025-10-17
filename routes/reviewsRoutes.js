const express = require('express');
const router = express.Router();
const ViewsController = require('../controllers/reviewController');
 const Shema=require('../validators/reviewValidation');
 const  validate=require('../middlewares/validate');
 const limiter=require('../middlewares/rate-limiter');
 
const controller = new ViewsController();

router.post('/:productId/review',validate(Shema.createreViewSchema), controller.createreView);

router.get('/:productId/review',limiter.apiLimiter,controller.getAllreViews);
router.put('/:productId/review/:id', controller.updateUsereView);
router.delete('/:productId/review/:id',controller.deleteUsereView)

//  router admin :
router.delete('/review/:id', controller.deletereViews);
router.put('/review/:id', controller.updatereViews);






module.exports = router;
