/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/
const router = require('express').Router();
const userController = require("../controllers/userController");
const upload = require('../middleware/Multer');

// Route user 
router.get('/', userController.getUsers);
router.get('/:username', userController.getUser);
router.get('/get/count', userController.getCount);
router.post('/', upload.single('image'), userController.addUser);
router.put('/:username', upload.single('image'), userController.modifyUser);
router.delete('/:username', userController.deleteUser);

module.exports = router;