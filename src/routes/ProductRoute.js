/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const router = require('express').Router();
const productController = require("../controllers/ProductController");
const upload = require('../middleware/Multer');

//Route product
//router.get('/', productController.getProducts);
//router.get('/:id', productController.getProduct);
router.post('/', upload.single('image'), productController.addProduct);
//router.put('/:id', upload.single('image'), productController.modifyProduct);
//router.delete('/:id', productController.deleteProduct);

module.exports = router;
