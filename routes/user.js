const router = require('express').Router();
const userHandler = require('../handlers/user');
const authMiddleware = require('../middleware/auth');
const passport = require('passport');
const multer = require('multer');

// specify storage and filename options
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/images/')
    },
    filename: function (req, file, cb) {
        let fileArr = file.originalname.split('.')
        let fileExt = fileArr[fileArr.length - 1];
        cb(null, req.user.id + '-' + Date.now() + "." + fileExt);
    }
})
const upload = multer({ storage });

router.use(authMiddleware());

router.get("/", userHandler.getUsers);
router.get("/:id", userHandler.getUser);
router.patch("/:id", userHandler.updateUser);
router.post("/:id/changePassword", userHandler.changePassword);
router.delete("/:id", userHandler.removeUser);
router.post("/:id/profileImage", upload.single('avatar'), userHandler.updateProfileImage)

module.exports = router;