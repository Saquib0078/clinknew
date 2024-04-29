const mongoose = require("mongoose");


const stickerSchema = new mongoose.Schema({
    imageID: { type: String },
 
  },{
    timestamps: true
});

module.exports = mongoose.model('Sticker', stickerSchema);

