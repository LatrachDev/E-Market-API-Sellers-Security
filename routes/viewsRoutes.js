const express = require('express');
const router = express.Router();
const ViewsController = require('../controllers/ViewsController');
 const viewShema=require('../validators/viewValidation');
 const  validate=require('../middlewares/validate');
 
const controller = new ViewsController();

router.post('/:productId/review',validate(viewShema.createViewSchema), controller.createView);

router.get('/:productId/review', controller.getAllViews);
router.put('/:productId/review/:id', controller.updateUserView);
router.delete('/:productId/review/:id',controller.deleteUserView)

//  router admin :
router.delete('/review/:id', controller.deleteViews);
router.put('/review/:id', controller.updateViews);






module.exports = router;
