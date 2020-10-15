const Class = require('../models').Class;
const { createResultsCollection, copyToObj, parseRequest } = require('../utilities');

module.exports = {
    createClass: async function (req, res, next) {
        try {
            let doc = { ...req.body };
            doc.ownerId = req.user._id;
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
            // let classes = await Class.find(filter).populate('ownerId decks', 'firstName lastName deckName -_id');
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
            // let classObj = await Class.findById(id).populate('ownerId decks', 'firstName lastName deckName -_id');
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
        let ownerId = req.user._id;
        try {
            let classes = await Class.find({
                ownerId
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
    }
}