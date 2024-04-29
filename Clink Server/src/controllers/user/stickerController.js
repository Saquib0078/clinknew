const StickerModel= require('../../models/stickerModel')
const {stickersPath} = require("../../managers/fileManager");


const PostSticker = async (req, res) => {
    try {
        const imageID = req.file; 
        console.log(imageID); 

        const img = {
        
            imageID:imageID.filename,

        };
        const upload =await StickerModel.create(img);
        
        res.status(201).json({ message: 'Sticker uploaded successfully' });
    } catch (err) {
        console.error('Error uploading sticker', err);
        res.status(500).json({ error: err.message });
    }
};


const getStickers=async (req, res) => {
    try {
        const stickers = await StickerModel.find();
        if (!stickers){
            return res.status(400).json( {"message":"No stickers found"} );

        }
        return res.status(200).json({stickers:stickers})

    } catch (err) {
        console.error('Error fetching stickers', err);
        res.status(500).json({ error: err.message});
    }
};


const updateStickers=async (req, res) => {
    try {
        const { id } = req.params;
        const { url } = req.body;
        const sticker = await StickerModel.findByIdAndUpdate(id, { url }, { new: true });
        if (!sticker) {
            return res.status(404).json({ error: 'Sticker not found' });
        }
        res.json(sticker);
    } catch (err) {
        console.error('Error updating sticker', err);
        res.status(500).json({ error: err.message });
    }
};

const deleteStickrs=async (req, res) => {
    try {
        const { id } = req.params;
        const sticker = await StickerModel.findByIdAndDelete(id);
        if (!sticker) {
            return res.status(404).json({ error: 'Sticker not found' });
        }
        res.json({ message: 'Sticker deleted successfully' });
    } catch (err) {
        console.error('Error deleting sticker', err);
        res.status(500).json({ error: err.message });
    }
};

const getStickerMedia = (req, res) => {
    let {stickerid} = req.params;

    if (!stickerid) {
        return respondFailed(res, "000");
    }
   
    res.sendFile(stickersPath + stickerid, (err) => {
        if (err) {
            // console.log(err);
            // throwError(res, {
            //     msg: "file not found"
            // });
        }
    });
}

module.exports={PostSticker,getStickers,updateStickers,deleteStickrs,getStickerMedia};