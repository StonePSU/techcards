const Deck = require('../models').Deck;

module.exports = {
    createDeck: async function (req, res, next) {
        try {
            let deck = Deck.create(req.body);
            res.status(201).json(deck);
        } catch (err) {
            next(err);
        }
    }
}