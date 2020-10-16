const Card = require('../models').Card;
const { createResultsCollection, copyToObj, parseRequest } = require('../utilities');

module.exports = {
    createCard: async function (req, res, next) {
        try {
            const doc = { ...req.body };
            doc.ownerId = req.user._id;
            const card = await Card.create(doc);
            return res.status(201).json(card);
        } catch (err) {
            next(err);
        }

    },
    getCardById: async function (req, res, next) {
        try {
            const id = req.params.id;
            const { expand } = parseRequest(req);

            const card = await Card.findById(id).populate(expand);

            if (!card) {
                return res.status(404).send();
            }

            return res.status(200).json(card);

        } catch (err) {
            next(err);
        }
    },
    getCards: async function (req, res, next) {
        const { filter, expand } = parseRequest(req);
        try {
            const cards = await Card.find(filter).populate(expand);
            res.status(200).json(createResultsCollection(cards));
        } catch (err) {
            next(err);
        }
    },
    updateCard: async function (req, res, next) {
        const id = req.params.id;
        try {
            const card = await Card.findById(id);
            if (!card) {
                return res.status(404).send();
            }
            copyToObj(req.body, card);
            const saved = await card.save();
            return res.status(200).json(saved);
        } catch (err) {
            next(err);
        }
    },
    deleteCard: async function (req, res, next) {
        const id = req.params.id;

        try {
            const card = await Card.findById(id);
            if (!card) {
                return res.status(404).send();
            }

            await card.remove();
            return res.status(200).send();

        } catch (err) {
            return next(err);
        }
    }
}
