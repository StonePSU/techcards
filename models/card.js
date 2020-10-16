const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Deck = require('./deck');

const CardSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deckId: {
        type: Schema.Types.ObjectId,
        ref: 'Deck',
        required: true,
        set: function (value) {
            this._previousDeckId = this.deckId;
            return value;
        }
    }
},
    {
        timestamps: true
    }
);

CardSchema.pre('remove', async (next) => {
    try {
        // remove the card from the associated deck
        const deckId = this.deckId;

        if (!deckId) return next();

        const deck = await Deck.findById(deckId);

        if (!deck) {
            let err = new Error("Deck not found");
            return next(err);
        }

        deck.cards.remove(this._id);
        await deck.save();
        return next();

    } catch (err) {
        return next(err);
    }
})

CardSchema.pre('save', async function (next) {
    try {
        // if this is a new card, add the card id to the correct deck

        if (this.isNew) {
            const deckId = this.deckId;

            const deck = await Deck.findById(deckId);

            if (!deck) {
                let err = new Error("Deck not found");
                return next(err);
            }

            deck.cards.push(this._id);
            await deck.save();
            return next();

        } else {
            // we are updating the deck
            // check to see if the previous deck id is defined and if it is different then the current
            if (this._previousDeckId && this._previousDeckId !== this.deckId) {
                // get the original deck...
                const originalDeck = await Deck.findById(this._previousDeckId);

                if (!originalDeck) {
                    let err = new Error("Original Deck not found");
                    return next(err);
                }

                //... and remove the card id
                originalDeck.cards.remove(this._id);
                await originalDeck.save();

                // get the new deck...
                const newDeck = await Deck.findById(this.deckId);
                if (!newDeck) {
                    let err = new Error("New Deck not found");
                    return next(err);
                }

                //...and add the card id
                newDeck.cards.push(this._id);
                await newDeck.save();
                return next();
            }
        }
    } catch (err) {
        return next(err);
    }
})

const Card = mongoose.model('Card', CardSchema);
module.exports = Card;