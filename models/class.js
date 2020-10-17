const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClassSchema = new Schema({
    className: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    decks: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Deck'
        }
    ]
},
    {
        timestamps: true
    }
)

const Class = mongoose.model('Class', ClassSchema);

module.exports = Class;