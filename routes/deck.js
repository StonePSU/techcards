const express = require('express');
const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const deckHandler = require('../handlers/deck');

router.use(authMiddleware());

router.post('/', deckHandler.createDeck);

module.exports = router;