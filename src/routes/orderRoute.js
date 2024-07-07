/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const router = require('express').Router();
const orderController = require("../controllers/orderController");

// Route order
router.get('/', orderController.getOrders);
router.get('/:name', orderController.getOrder);
router.post('/', orderController.addOrder);
router.put('/:name', orderController.modifyOrder);
router.delete('/:name', orderController.deleteOrder);

module.exports = router;