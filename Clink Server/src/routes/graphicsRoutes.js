const express = require('express');
const {CreateGraphics,getGraphics,GetGraphics,UpdateGraphics,CreateSlider,CreatechipButtonList,
    DeleteChipButtonList,UpdateChipButtonList,DeleteSlider,UpdateSlider,DeleteGraphics, GetChipButtonList,GetSlider} = require("../controllers/user/graphicsController");
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
        // req.body.type = type;
        req.body.filename = filename;
        cb(null, filename);
    },
});

const upload = multer({storage: storage});

router.post('/controllers/createGraphics',upload.array("graphicModelList",12), CreateGraphics);

router.get("/getgraphics/:graphicsId", getGraphics);
router.get("/getGraphicsMedia", GetGraphics);
router.get("/getSlider", GetSlider);
router.get("/getchipButtonList", GetChipButtonList);


router.put("/controllers/updateGraphicsMedia/:id",upload.fields([
    { name: 'graphicModelList', maxCount: 12 },
]), UpdateGraphics);

router.post("/controllers/chipButtonList",CreatechipButtonList)

router.post("/controllers/slider",upload.single("slider"),CreateSlider);

router.put("/controllers/slider/:sliderId",upload.single("slider"),UpdateSlider);
router.delete("/controllers/slider/:sliderId",DeleteSlider);

router.put("/controllers/Graphic/:graphicsId",upload.single("graphicModel"),UpdateGraphics);
router.delete("/controllers/Graphic/:graphicsId",DeleteGraphics);


router.put("/controllers/chipButtonList/:chipButtonListId",UpdateChipButtonList)
router.delete("/controllers/chipButtonList/:chipButtonListId",DeleteChipButtonList)


module.exports = router;