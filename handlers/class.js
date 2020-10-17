const { Class, Deck } = require('../models');
const { createResultsCollection, copyToObj, parseRequest } = require('../utilities');

module.exports = {
    createClass: async function (req, res, next) {
        try {
            let doc = { ...req.body };
            doc.owner = req.user._id;
            let newClass = await Class.create(doc);
            res.status(201).json(newClass);

        } catch (err) {
            next(err);
        }

    },
    getClasses: async function (req, res, next) {
        // let filter = req.query;
        // let expand = req.query.expand;
        // if ('expand' in req.query) {
        //     // remove the expand parameter so it doesn't get used in the filter
        //     delete filter.expand;
        // }

        const { filter, expand } = parseRequest(req);

        try {
            // let classes = await Class.find(filter).populate('owner decks', 'firstName lastName deckName -_id');
            let classes = await Class.find(filter).populate(expand);
            res.status(200).json(createResultsCollection(classes));
        } catch (err) {
            next(err);
        }
    },
    getClassById: async function (req, res, next) {
        let id = req.params.id;
        const { expand } = parseRequest(req);
        try {
            // let classObj = await Class.findById(id).populate('owner decks', 'firstName lastName deckName -_id');
            let classObj = await Class.findById(id).populate(expand);
            if (!classObj) {
                return res.status(404).json({ message: "Class not found for given id" })
            }
            return res.status(200).json(classObj);
        } catch (err) {
            next(err);
        }
    },

    // function to return only classes created by logged in user
    getMyClasses: async function (req, res, next) {
        let owner = req.user._id;
        try {
            let classes = await Class.find({
                owner
            })
            res.status(200).json(createResultsCollection(classes));

        } catch (err) {
            next(err);
        }

    },

    updateClass: async function (req, res, next) {
        let id = req.params.id;

        try {
            let classObj = await Class.findById(id);
            copyToObj(req.body, classObj);
            let saved = await classObj.save();
            res.status(200).json(saved);

        } catch (err) {
            next(err);
        }
    },

    deleteClass: async function (req, res, next) {
        let id = req.params.id;

        try {
            let classObj = await Class.findById(id);
            if (!classObj) {
                return res.status(404).send();
            }

            await classObj.remove();
            return res.status(200).send();


        } catch (err) {
            next(err);
        }
    },
    createDeckInClass: async function (req, res, next) {
        const classId = req.params.id;
        try {
            const doc = { ...req.body };
            doc.owner = req.user._id;
            const deck = await Deck.create(doc);
            const classObj = await Class.findById(classId);
            if (!classObj) {
                return next(new Error("Class Id invalid"));
            }

            classObj.decks.push(deck._id);
            await classObj.save()
            return res.status(201).json(classObj);

        } catch (err) {
            return next(err);
        }
    },
    removeDeckFromClass: async function (req, res, next) {
        const classId = req.params.id;
        const deckId = req.params.deckId;

        try {
            const classObj = await Class.findById(classId);
            if (!classObj) {
                return next(new Error("Class Id invalid"))
            }

            classObj.decks.remove(deckId);
            const updatedClass = await classObj.save();
            return res.status(200).json(updatedClass);
        } catch (err) {
            return next(err);
        }
    },
    linkDeckToClass: async function (req, res, next) {
        const classId = req.params.id;
        const deckId = req.params.deckId;

        try {
            const deck = await Deck.findById(deckId);
            const classObj = deck && await Class.findById(classId);
            if (classObj) {
                // only add the deck if it's not already there
                const count = !classObj.decks.includes(deckId) && classObj.decks.push(deckId);

                // save the class and return the updated object
                const updatedClass = await classObj.save();
                return res.status(200).json(updatedClass);
            }

            // something didn't work out
            return res.status(400).json({ message: "An error occurred" })
        } catch (err) {
            return next(err);
        }
    }
}