const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const Class = require('./class');

const DeckSchema = new Schema({
    deckName: {
        type: String,
        required: true
    },
    classId: {
        type: Schema.Types.ObjectId,
        ref: 'Class'
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cards: {
        type: Schema.Types.ObjectId,
        ref: 'Card'
    }
}, {
    timestamps: true
})

DeckSchema.pre('remove', async function (next) {
    let classId = this.classId;
    let deckId = this._id;

    if (classId) {
        // need to remove this deck from the class
        let classObj = await Class.findById(classId);
        classObj.decks.filter(id => id !== deckId);
        await classObj.save();
        return next();
    } else {
        let err = new Error("Class Not Found");
        return next(err);
    }

});

DeckSchema.pre('save', async function (next) {
    console.log("deck presave middleware")
    if (this.isNew) {
        let classId = this.classId;
        let classObj = await Class.findById(classId);
        if (!classObj) {
            let err = new Error("Class Not Found");
            return next(err);
        }

        classObj.decks.push(this._id);
        await classObj.save();
        return next();
    }
})

const Deck = mongoose.model('Deck', DeckSchema);

module.exports = Deck;