/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

function errorHandler(err, req, res, next) {
    if (err && err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'Unauthorized user!' });
    }

    if (err && err.name === 'ValidationError') {
        return res.status(401).json({ message: err.message });
    }

    return res.status(500).json(err);
}

module.exports = errorHandler;
