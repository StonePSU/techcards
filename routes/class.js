const express = require('express');
const router = express.Router();
const classHandler = require('../handlers/class');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware());

// create
router.post('/', classHandler.createClass);

// get
router.get('/', classHandler.getClasses)
router.get('/myClasses', classHandler.getMyClasses)
router.get('/:id', classHandler.getClassById);

// update
router.put('/:id', classHandler.updateClass);

// remove
router.delete('/:id', classHandler.deleteClass)

module.exports = router;