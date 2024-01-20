/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const multer = require('multer');
const path = require('path');

module.exports = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        let extension = path.extname(file.originalname);
        if (extension !== ".jpg" && extension !== ".png" && extension !== ".jpeg") {
            cb(new Error("File type is not supported"), false);
            return;
        }
        cb(null, true);
    }
});