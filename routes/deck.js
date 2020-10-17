const express = require('express');
const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const deckHandler = require('../handlers/deck');

router.use(authMiddleware());

// create
router.post('/', deckHandler.createDeck);
router.post('/:id/card', deckHandler.createCardInDeck);

router.get('/', deckHandler.getDecks);
router.get('/:id', deckHandler.getDeckById);

router.put('/:id', deckHandler.updateDeck);
router.put('/:id/card/:cardId', deckHandler.updateCardInDeck);

router.delete('/:id', deckHandler.deleteDeck);
router.delete('/:id/card/:cardId', deckHandler.deleteCardInDeck);

module.exports = router;