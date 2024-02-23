const mongoose = require("mongoose");



  
  const universalModelSchema = new mongoose.Schema({
    title: String,
    type: String,
    slider:[String],
    graphicModelList: [String],
    chipButtonList: [String],
  },{
    timestamps: true
});
  
module.exports = mongoose.model('UniversalModel', universalModelSchema);
  