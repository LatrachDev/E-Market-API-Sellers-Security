const express = require('express');
const router = express.Router();
const ViewsController = require('../controllers/ViewsController');
const controller = new ViewsController();

router.post('/:productId/review', controller.createView);

router.get('/:productId/review', controller.getAllViews);
// router.put('/:productId/review/:id', controller.updateView);


// router.delete('/:productId/review/:id', controller.deleteView);




module.exports = router;
