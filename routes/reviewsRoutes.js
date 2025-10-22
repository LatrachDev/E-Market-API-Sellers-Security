const express = require('express');
const router = express.Router();
const ViewsController = require('../controllers/reviewController');
 const Shema=require('../validators/reviewValidation');
 const  validate=require('../middlewares/validate');
 const limiter=require('../middlewares/rate-limiter');
 const auth=require('../middlewares/auth');
 
const controller = new ViewsController();

router.post('/:productId/review',auth.authMiddleware,validate(Shema.createreViewSchema), controller.createreView);

router.get('/:productId/review',limiter.apiLimiter,controller.getAllreViews);
router.put('/:productId/review/:id',auth.authMiddleware, controller.updateUsereView);
router.delete('/:productId/review/:id',auth.authMiddleware,controller.deleteUsereView)

//  router admin :
router.delete('/review/:id',auth.authMiddleware, controller.deletereViews);
router.put('/review/:id',auth.authMiddleware, controller.updatereViews);






module.exports = router;
