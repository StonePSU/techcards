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
        ref: 'Class',
        set: function (classId) {
            this._previousClassId = this.classId;
            return classId;
        }
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cards: [{
        type: Schema.Types.ObjectId,
        ref: 'Card'
    }]
}, {
    timestamps: true
})

DeckSchema.pre('remove', async function (next) {
    const classId = this.classId;
    const deckId = this._id;

    try {
        if (classId) {
            // need to remove this deck from the class
            const classObj = await Class.findById(classId);
            if (classObj) {
                classObj.decks.remove(deckId);
                await classObj.save();
            }
        } else {
            const err = new Error("Class Not Found");
            return next(err);
        }

        return next();
    } catch (err) {
        return next(err);
    }

});

DeckSchema.pre('save', async function (next) {
    if (this.isNew) {
        const classId = this.classId;
        const classObj = await Class.findById(classId);
        if (!classObj) {
            const err = new Error("Class Not Found");
            return next(err);
        }

        classObj.decks.push(this._id);
        await classObj.save();
        return next();
    } else {
        // if the class id has been updated then we need to remove the deck id from the original class...
        if (this._previousClassId && this._previousClassId !== this.classId) {
            const classOld = await Class.findById(this._previousClassId);

            if (!classOld) {
                const err = new Error("Class Not Found");
                return next(err);
            }

            classOld.decks.remove(this._id);
            await classOld.save();

            //... and add it to the new class
            const classNew = await Class.findById(this.classId);
            if (!classNew) {
                const err = new Error("Class Not Found");
                return next(err);
            }

            classNew.decks.push(this._id);
            await classNew.save();

            return next();

        }

        return next();
    }
})

// DeckSchema.post('save', async function (next) {
//     console.log(`postsave: ${this.classId}`)
//     try {
//         // if the class id has been updated then we need to remove the deck id from the original class...
//         if (this.oldClassId !== this.classId) {
//             const classOld = await Class.findById(this.oldClassId);

//             if (!classOld) {
//                 const err = new Error("Class Not Found");
//                 return next(err);
//             }

//             classOld.decks.remove(this.oldClassId);
//             await classOld.save();

//             //... and add it to the new class
//             const classNew = await Class.findById(this.classId);
//             if (!classNew) {
//                 const err = new Error("Class Not Found");
//                 return next(err);
//             }

//             classNew.decks.push(this._id);
//             await classNew.save();

//             return next();

//         }
//     } catch (err) {
//         return next(err);
//     }
// })

const Deck = mongoose.model('Deck', DeckSchema);

module.exports = Deck;