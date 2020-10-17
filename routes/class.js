const express = require('express');
const router = express.Router();
const classHandler = require('../handlers/class');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware());

// create
router.post('/', classHandler.createClass);
router.post('/:id/deck', classHandler.createDeckInClass);

// get
router.get('/', classHandler.getClasses)
router.get('/myClasses', classHandler.getMyClasses)
router.get('/:id', classHandler.getClassById);

// update
router.put('/:id', classHandler.updateClass);
router.put('/:id/deck/:deckId', classHandler.linkDeckToClass);

// remove
router.delete('/:id', classHandler.deleteClass)
router.delete('/:id/deck/:deckId', classHandler.removeDeckFromClass);

module.exports = router;