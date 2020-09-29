const passport = require("passport");

module.exports = function () {
    return passport.authenticate("jwt", { session: false });
};
