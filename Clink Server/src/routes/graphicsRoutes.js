const express = require('express');
const {CreateGraphics} = require("../controllers/user/graphicsController");
const{graphicsPath}=require('../managers/fileManager')
const router = express.Router();
const multer = require("multer");
const {dataPath} = require("../managers/fileManager");
const {generateRandomID} = require("../helpers/appHelper");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, graphicsPath+ "/");
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

router.post('/controllers/createGraphics',upload.array('graphicModelList',12),CreateGraphics)


module.exports = router;