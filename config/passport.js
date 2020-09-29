const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const db = require('../models');
const passport = require('passport');

module.exports = function () {

    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = process.env.JWT_KEY;
    opts.issuer = "PhoenixRising Web Design";

    passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            const user = await db.User.findOne({ _id: jwt_payload.sub }, { password: false });
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }

        } catch (err) {
            done(err);
        }
    }))
}
