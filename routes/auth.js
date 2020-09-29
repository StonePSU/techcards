const express = require('express');
const router = express.Router();
const authHandler = require("../handlers/auth");

router.post("/signup", authHandler.signup);
router.post("/login", authHandler.signin);


module.exports = router;