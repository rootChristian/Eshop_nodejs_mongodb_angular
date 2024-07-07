/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const { expressjwt: expressJwt } = require('express-jwt');

function authJwt() {
    const api = process.env.API_URL;
    const secret = process.env.SECRET_TOKEN_KEY;

    return expressJwt({ 
            secret, 
            algorithms: ["HS256"],
            isRevoked: isRevoked
        }).unless({
            path: [
                `${api}/auth`,
                { url: `${api}/users`, methods: ["POST"] },
                { url: /\/api\/v1\/categories(.*)/, methods: ["GET"] },
                { url: /\/api\/v1\/products(.*)/, methods: ["GET"] },
            ]
    });
}

async function isRevoked(req, payload) {
    try {
        if(payload.payload.role !== "ROOT" && payload.payload.role !== "ADMIN") {
            //console.log('Unauthorized user!');
            return true;
        }
        //console.log('Authorized user!');
        return false;
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
}

module.exports = authJwt;
