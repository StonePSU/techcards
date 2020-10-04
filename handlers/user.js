const { User } = require("../models")
const cloud = require('cloudinary').v2;
const fs = require('fs');
const copyToObj = require('../utilities/').copyToObj;

cloud.config({
    cloud_name: process.env.CLOUDINARY_CLOUD,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_APISECRET
})

const userHandler = {

    getUser: async function (req, res, next) {

        try {
            let user = await User.findById(req.params.id, { password: false });
            if (!user) {
                let err = new Error("User not found");
                err.status = 404;
                return next(err);
            }
            return res.status(200).json(user);

        } catch (err) {
            next(err);
        }

    },

    getUsers: async function (req, res, next) {
        try {
            let users = await User.find(req.query, { password: false });
            res.status(200).json({
                items: users.length,
                users
            })
        } catch (err) {
            next(err);
        }

    },

    updateUser: async function (req, res, next) {

        try {
            const id = req.params.id;
            const body = req.body;

            const user = await User.findById(id);
            if (!user) {
                let err = new Error("Not Found");
                err.status = 404;
                return next(err);
            }
            // const keys = Object.keys(body);
            // for (let key in body) {
            //     if (typeof (body[key]) === 'object' && !Array.isArray(body[key])) {
            //         let childKeys = Object.keys(body[key]);
            //         for (let child of childKeys) {
            //             user[key][child] = body[key][child];
            //         }
            //     } else {
            //         user[key] = body[key];
            //     }
            // }
            copyToObj(body, user);

            let saved = await user.save();
            let tempSaved = saved.toJSON();
            return res.status(200).json(tempSaved);

        } catch (err) {
            next(err);
        }

    },

    removeUser: async function (req, res, next) {
        try {
            const id = req.params.id;

            const user = await User.findById(id);
            // if the user can't be found return a 404
            if (!user) {
                return res.status(404).send();
            }

            await user.remove();
            return res.status(200).send();

        } catch (err) {
            next(err);
        }

    },

    changePassword: async function (req, res, next) {
        try {
            const { originalPassword, password } = req.body;
            const id = req.params.id;

            // if parameters are missing respond with an error
            if (!originalPassword || !password) {
                let err = new Error("Invalid message body");
                err.status = 400;
                return next(err);
            }

            // if originalPassword and password match return an error
            if (originalPassword === password) {
                let err = new Error("Original password cannot match new password");
                err.status = 400;
                return next(err);
            }

            // if user cannot be found all return an error
            const user = await User.findById(id);
            if (!user) {
                let err = new Error("User not found");
                err.status = 404;
                return next(err);
            }

            // check to see if the original password matches the stored password
            let match = await user.comparePassword(originalPassword);
            if (!match) {
                // if password doesn't match return an error;
                let err = new Error("Invalid original password");
                err.status = 400;
                return next(err);
            }

            user.password = password;
            let saved = await user.save();
            let tempSaved = saved.toJSON();
            return res.status(200).json(tempSaved);

        } catch (err) {
            return next(err);
        }

    },

    updateProfileImage: async function (req, res, next) {
        const userId = req.params.id;
        let cloudImage;

        // if there is no file attached return an error
        if (!req.file || req.file === undefined) {
            let error = new Error("File not found for upload");
            return next(error);
        }

        const imageLoc = `${process.cwd()}\\${req.file.path}`;

        // make sure that the uploaded file is either png, jpg, jpeg or gif
        if (req.file.mimetype !== 'image/png' && req.file.mimetype !== 'image/jpg' && req.file.mimetype !== 'image/jpeg' && req.file.mimetype !== 'image/gif') {
            let error = new Error('Invalid file type for upload');
            await fs.promises.unlink(imageLoc);
            return next(error);
        }

        // check if user performing the update and the user being updated are the same
        if (userId !== req.user.id) {
            let error = new Error('Access Denied - Unable to update user profile image')
            return next(error);
        }

        // upload the file to cloudinary
        try {
            cloudImage = await cloud.uploader.upload(imageLoc, { height: 150, width: 150, crop: "limit" });

            // once the file is uploaded to cloudinary, delete it from the uploads directory
            await fs.promises.unlink(imageLoc);
        } catch (err) {
            return next(err);
        }

        // upload the user profile with the profileImageURL
        try {
            let user = await User.findById(req.user.id);
            user.profileImageURL = cloudImage.url;

            let saved = await user.save();
            let tempSaved = saved.toJSON();
            return res.status(200).json(tempSaved);
        } catch (err) {
            return next(err);
        }

        /* req.file
        {
        fieldname: 'avatar',
        originalname: 'nav-bg.png',
        encoding: '7bit',
        mimetype: 'image/png',
        destination: 'uploads/',
        filename: '577ad02fecf99bf5ee489e9fe527ea4a',
        path: 'uploads\\577ad02fecf99bf5ee489e9fe527ea4a',
        size: 2022
        }
        */

    }

}

module.exports = userHandler;