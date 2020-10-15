const express = require('express');
const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const deckHandler = require('../handlers/deck');

router.use(authMiddleware());

router.post('/', deckHandler.createDeck);
router.get('/', deckHandler.getDecks);
router.get('/:id', deckHandler.getDeckById);
router.put('/:id', deckHandler.updateDeck);
router.delete('/:id', deckHandler.deleteDeck);

module.exports = router;