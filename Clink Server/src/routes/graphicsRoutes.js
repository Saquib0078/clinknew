const express = require('express');
const {CreateGraphics,getGraphics,GetGraphics,UpdateGraphics,CreatechipButtonList,CreateSlider} = require("../controllers/user/graphicsController");
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

router.post('/controllers/createGraphics', upload.fields([
    { name: 'graphicModelList', maxCount: 12 },
]), CreateGraphics);

router.get("/getgraphics/:graphicsId", getGraphics);
router.get("/getGraphicsMedia", GetGraphics);

router.put("/controllers/updateGraphicsMedia/:id",upload.fields([
    { name: 'graphicModelList', maxCount: 12 },
]), UpdateGraphics);

router.post("/controllers/chipButtonList",CreatechipButtonList)

router.post("/controllers/slider",upload.array("slider",12),CreateSlider);

module.exports = router;