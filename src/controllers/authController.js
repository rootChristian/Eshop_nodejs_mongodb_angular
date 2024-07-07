/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { signInBodyValidation} = require('../middleware/validationSchema');

// User login
module.exports.login = asyncHandler(async (req, res) => {
    try {
        const { error } = signInBodyValidation(req.body);
        if (error)
            return res.status(400).json({ error: true, message: error.details[0].message });

        const { username, email, password } = req.body;

        const secret_token = process.env.SECRET_TOKEN_KEY;
        const expires_access = process.env.EXPIRES_IN_TOKEN_ACCESS;

        let user;

        // Vérifie si un nom d'utilisateur est fourni dans la requête
        if (username) {
            user = await User.findOne({ username }).lean().exec();
        }
        
        // Si aucun utilisateur n'est trouvé par nom d'utilisateur, vérifie par e-mail
        if (!user && email) {
            user = await User.findOne({ email }).lean().exec();
        }

        // Si aucun utilisateur n'est trouvé
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid username or email!' });
        }

        // Vérifie si l'utilisateur est actif
        if (!user.active) {
            return res.status(401).json({ message: 'Unauthorized!' });
        }

        // Vérifie le mot de passe haché
        if (await argon2.verify(user.password, password)) {
            const payload = { userId: user._id, username: user.username, role: user.role };
            // Generate a token for the user
            const token = jwt.sign(
                payload,
                secret_token,
                { expiresIn: expires_access }
            )

            return res.status(200).json({ success: true, username: user.username, accessToken: token, message: 'Authentication successful...' });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid password!' });
        }
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});
