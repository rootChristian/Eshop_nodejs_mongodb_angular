/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const router = require('express').Router();
const productController = require("../controllers/productController");
const upload = require('../middleware/Multer');

//Route product
router.get('/', productController.getProducts);
router.get('/:name', productController.getProduct);
router.get('/get/count', productController.getCount);
router.get('/get/featured', productController.getFeatured);
router.get('/get/featured/:count', productController.getFeatured);
router.post('/', upload.single('image'), productController.addProduct);
router.put('/:name', upload.single('image'), productController.modifyProduct);
router.delete('/:name', productController.deleteProduct);

module.exports = router;
