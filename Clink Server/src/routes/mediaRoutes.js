const express = require('express');
const { getBroadcastMedia,
    publishBroadcast,
    getBroadcast,
    pinBroadcast,
    unpinBroadcast,
    likeBroadcast,
    removeLikeBroadcast,
    deleteBroadcast,
    getBroadcastComments,
    getBroadcastCommentReplies,
    commentBroadcast,
    replyCommentBroadcast,
    updateBroadcast,
    deleteCommentBroadcast} = require("../controllers/user/broadcastController");
const { broadcastsPath } = require('../managers/fileManager');
const multer = require('multer');
const { verifyJwt } = require('../middleware/jwtAuthMiddleware');
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, broadcastsPath+ "/");
    }, filename: (req, file, cb) => {
        let tempFilename = file.originalname;
        let id = generateRandomID();
        let type = tempFilename.substring(tempFilename.lastIndexOf(".") + 1);
        let filename = id + "." + type;
        req.body.id = id;
        req.body.type = type;
        req.body.filename = filename;
        cb(null, filename);
    },
});
const upload = multer({storage: storage});

router.get("/getBroadcastMedia/:broadcastMediaID", getBroadcastMedia);

router.post("/controllers/publishBroadcast/:type", verifyJwt, upload.single('media'), publishBroadcast);


router.put("/controllers/publishBroadcast/:type", verifyJwt, upload.single('media'), publishBroadcast);

// router.get("/getBroadcastMedia/:broadcastMediaID", getBroadcastMedia);


module.exports = router;