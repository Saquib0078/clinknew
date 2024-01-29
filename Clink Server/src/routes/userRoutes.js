const express = require('express');
const multer = require("multer");
const {loginRateLimit, registerRateLimit, otpRateLimit} = require("../managers/rateLimitManager");
const {login, sessionLogin} = require("../auth/user/userLogin");
const {checkRegister, register} = require("../auth/user/userRegister");
const {verifyJwt, verifyJwtUnSession} = require("../middleware/jwtAuthMiddleware");
const {resendOTP} = require("../auth/user/userActions");
const {getUserById, queryUsers,UpdateUser,UpdateUserPrimary,getUSers,UpdateNameonFrame,getBroadcastMedia,SendNotification}=require('../controllers/user/userController')

const{CreateGraphics}=require('../controllers/user/graphicsController')
const {
    getBroadcast,
    likeBroadcast,
    removeLikeBroadcast,
    deleteBroadcast,
    commentBroadcast,
    getBroadcastComments,
    getBroadcastCommentReplies,
    replyCommentBroadcast,
    deleteCommentBroadcast,
    publishBroadcast, pinBroadcast, unpinBroadcast
} = require("../controllers/user/broadcastController");
const {setUserInfo} = require("../controllers/user/userController");
const {getNetworks,getNetworksNotification} = require("../controllers/user/networkController");
const {usersPath} = require("../managers/fileManager");
const {generateRandomID} = require("../helpers/appHelper");
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, usersPath+ "/");
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

router.post('/controllers/send-notification',SendNotification)

/* Authentication Routes */
router.post("/auth/checkRegister", registerRateLimit, checkRegister);
router.post("/auth/register", registerRateLimit, register);
router.post("/auth/login", loginRateLimit, login);
router.post("/auth/sessionLogin", verifyJwt, sessionLogin);
router.post("/auth/actions/resendOTP", otpRateLimit, resendOTP);

router.get('/controllers/getUser/:userId',getUserById)
router.put('/controllers/user/:id',UpdateUser)
router.put('/controllers/users/:id',verifyJwt,UpdateUserPrimary)
router.put('/controllers/frameusers/:id',upload.single('Image'),UpdateNameonFrame)




router.get('/controllers/getUser',queryUsers)
router.get('/controllers/getUsers',getUSers)

router.get("/user/:broadcastMediaID", getBroadcastMedia);

router.post("/controllers/setUserInfo", verifyJwtUnSession, setUserInfo);
router.post("/controllers/getNetworks/:skip", verifyJwt, getNetworks);
router.get("/controllers/getNetworks", verifyJwt, getNetworksNotification);


router.post("/controllers/publishBroadcast/:type", verifyJwt, upload.single('media'), publishBroadcast);
router.post("/controllers/getBroadcasts/:skip", verifyJwt, getBroadcast);
router.post("/controllers/pinBroadcast/:broadcastID", verifyJwt, pinBroadcast);
router.post("/controllers/unpinBroadcast/:broadcastID", verifyJwt, unpinBroadcast);
router.post("/controllers/deleteBroadcast/:broadcastID", verifyJwt, deleteBroadcast);

router.post("/controllers/likeBroadcast/:broadcastID", verifyJwt, likeBroadcast);
router.post("/controllers/removeLikeBroadcast/:broadcastID", verifyJwt, removeLikeBroadcast);

router.post("/controllers/getBroadcastComments/:broadcastID/:skip", verifyJwt, getBroadcastComments);
router.post("/controllers/getBroadcastCommentReplies/:broadcastID/:commentID/:skip", verifyJwt, getBroadcastCommentReplies);
router.post("/controllers/commentBroadcast", verifyJwt, commentBroadcast);
router.post("/controllers/replyCommentBroadcast", verifyJwt, replyCommentBroadcast);
router.post("/controllers/deleteCommentBroadcast/:broadcastID/:commentID", verifyJwt, deleteCommentBroadcast);

module.exports = router;