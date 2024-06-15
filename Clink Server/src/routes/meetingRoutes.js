const express = require('express');
const {getMeet,meeting,updateMeet, deleteMeet,UpdateLiveStatus} = require("../controllers/meeting/meetingController");
const router = express.Router();
const multer = require("multer");
const {meetingPath} = require("../managers/fileManager");
const {generateRandomID} = require("../helpers/appHelper");
const{getMeetImage}=require('../controllers/meeting/meetingController')
const fs = require('fs');
const { verifyJwt } = require('../middleware/jwtAuthMiddleware');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, meetingPath + "/");
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

router.post("/meeting",upload.single('imageID'),verifyJwt, meeting);
router.get("/liveMeetings",getMeet );
router.put('/updateMeet/:id',updateMeet)
router.put('/updateLive/:id',UpdateLiveStatus)

router.get("/getMeeting/:broadcastMediaID", getMeetImage);
router.delete('/deleteMeet/:id',deleteMeet)


// router.get("/joinmeeting/", joinmeeting);


module.exports = router;