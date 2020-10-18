const Deck = require('../models').Deck;
const { createResultsCollection, copyToObj, parseRequest } = require('../utilities');

module.exports = {
    createDeck: async function (req, res, next) {
        try {
            const doc = { ...req.body };
            doc.owner = req.user._id;
            const deck = await Deck.create(doc);
            res.status(201).json(deck);
        } catch (err) {
            next(err);
        }
    },
    getDecks: async function (req, res, next) {
        const { filter, expand } = parseRequest(req);

        try {
            const decks = await Deck.find(filter).populate(expand);
            res.status(200).json(createResultsCollection(decks));
        } catch (err) {
            next(err);
        }
    },
    getDeckById: async function (req, res, next) {
        const id = req.params.id;
        const { expand } = parseRequest(req);
        try {
            const deck = await Deck.findById(id).populate(expand);

            if (!deck) {
                return res.status(404).send();
            }

            return res.status(200).json(deck);

        } catch (err) {
            next(err);
        }
    },
    updateDeck: async function (req, res, next) {
        const id = req.params.id;

        try {
            const deck = await Deck.findById(id);
            if (!deck) {
                return res.status(404).send();
            }
            copyToObj(req.body, deck);
            const saved = await deck.save();
            return res.status(200).json(saved);

        } catch (err) {
            next(err);
        }
    },
    deleteDeck: async function (req, res, next) {
        const id = req.params.id;

        try {
            await Deck.removeDeckAndUpdateClass(id);
            res.status(200).send();
            // const deck = await Deck.findById(id);
            // if (!deck) {
            //     return res.status(404).send();
            // }

            // await deck.remove();
            // return res.status(200).send();

        } catch (err) {
            return next(err);
        }
    },
    createCardInDeck: async function (req, res, next) {
        const { id } = req.params;

        try {
            const deck = await Deck.findById(id);
            if (!deck) return next(new Error("Deck Id Invalid"));

            if (!req.body.cards) return next(new Error("Cards attribute not found"));

            for (let card of req.body.cards) {
                deck.cards.push(card);
            }

            await deck.save();
            return res.status(201).json(deck);

        } catch (err) {
            return next(err);
        }
    },
    updateCardInDeck: async function (req, res, next) {

        const { id, cardId } = req.params;

        try {
            const deck = await Deck.findById(id);

            if (!deck) next(new Error("Invalid Deck Id"));

            deck.cards.forEach(element => {
                if (element._id.toString() === cardId) {
                    copyToObj(req.body, element);
                }
            })

            await deck.save();
            return res.status(200).json(deck);
        } catch (err) {
            return next(err);
        }
    },

    deleteCardInDeck: async function (req, res, next) {

        const { id, cardId } = req.params;

        try {
            const deck = await Deck.findById(id);
            deck.cards.remove(cardId);
            await deck.save();

            res.status(200).json(deck);
        } catch (err) {
            return next(err);
        }
    }
}