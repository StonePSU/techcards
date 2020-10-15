const express = require('express');
const router = express.Router();
const cardHandler = require('../handlers/card');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware());

router.post('/', cardHandler.createCard);
router.get('/:id', cardHandler.getCardById);
router.get('/', cardHandler.getCards);
router.put('/:id', cardHandler.updateCard);
router.delete('/:id', cardHandler.deleteCard);

module.exports = router;