const db = require('../models');
const jwt = require('jsonwebtoken')

function getToken(user) {
    const payload = {
        iss: "PhoenixRising Web Design",
        sub: user._id,
        firstName: user.firstName,
        lastName: user.lastName
    };
    const token = jwt.sign(payload, process.env.JWT_KEY);
    return token;
}

module.exports = {
    signup: async function (req, res, next) {
        try {
            // create user
            let user = await db.User.create(req.body);
            // generate jwt token
            let token = getToken(user);
            // return token to client for storage
            let tempUser = user.toJSON();
            res.status(201).json({ token, user: tempUser });
        } catch (err) {
            if (err.code === 11000) {
                err.message = "Email address already exists."
            }
            next(err);
        }

    },
    signin: async function (req, res, next) {
        try {
            // validate that both email address and password are in the payload
            if (!req.body.emailAddress || !req.body.password) {
                let err = new Error("Required attributes missing");
                err.status = 400;
                return next(err);
            }
            // find existing user
            let user = await db.User.findOne({ emailAddress: req.body.emailAddress });
            // if user can't be found, return an error
            if (!user) {
                let err = new Error("Authentication Failed");
                err.status = 401;
                return next(err);
            }
            // compare password
            let match = await user.comparePassword(req.body.password);
            // if password matches, generate jwt token
            if (!match) {
                let err = new Error("Authentication Failed");
                err.status = 401;
                return next(err);
            }
            let token = getToken(user);
            // return jwt to client
            let tempUser = user.toJSON();
            res.status(200).json({ token, user: tempUser });
        } catch (err) {
            return next(err);
        }
    }
}