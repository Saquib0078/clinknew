const express = require('express');
const {PostSticker,getStickers,updateStickers,deleteStickrs,getStickerMedia} = require("../controllers/user/stickerController");
const router = express.Router();
const multer = require("multer");
const {stickersPath} = require("../managers/fileManager");
const {generateRandomID} = require("../helpers/appHelper");
const fs = require('fs');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, stickersPath + "/");
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

router.post("/sticker",upload.single('imageID'), PostSticker);
router.get("/sticker",getStickers );
router.put('/sticker/:id',updateStickers)
router.get("/sticker/:stickerid", getStickerMedia);
router.delete('/sticker/:id',deleteStickrs)


// router.get("/joinmeeting/", joinmeeting);


module.exports = router;