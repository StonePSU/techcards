const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    emailAddress: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phoneNumber: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    profileImageURL: {
        type: String
    },
    theme: {
        primaryColor: {
            type: String,
            required: true,
            default: 'blue'
        },
        secondaryColor: {
            type: String,
            required: true,
            default: 'blue'
        },
        lightDark: {
            type: String,
            required: true,
            default: 'light'
        }
    }
}, {
    timestamps: true
})

// encrypt the password on a pre-save validation
UserSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) {
            return next();
        }

        let hashedPwd = await bcrypt.hash(this.password, 12);
        this.password = hashedPwd;
        return next();
    } catch (err) {
        return next(err);
    }
})

// instance method that accepts a password and then compares it to the password in the model
UserSchema.methods.comparePassword = async function (candidatePassword, next) {
    try {
        const match = await bcrypt.compare(candidatePassword, this.password);
        return match;
    } catch (err) {
        next(err);
    }
};

// instance method to remove the password from the object before sending back the user in JSON response
UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
}

const User = mongoose.model('User', UserSchema);

module.exports = User;