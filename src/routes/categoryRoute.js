/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const router = require('express').Router();
const categoryController = require("../controllers/categoryController");
const upload = require('../middleware/Multer');

// Route category
router.get('/', categoryController.getCategories);
router.get('/:name', categoryController.getCategory);
router.post('/', upload.single('image'), categoryController.addCategory);
router.put('/:name', upload.single('image'), categoryController.modifyCategory);
router.delete('/:name', categoryController.deleteCategory);

module.exports = router;