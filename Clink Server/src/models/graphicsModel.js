const mongoose = require("mongoose");



  
  const universalModelSchema = new mongoose.Schema({
    title: String,
    type: String,
    graphicModelList: [String],
  },{
    timestamps: true
});

const sliderSchema = new mongoose.Schema({
 
  slider:[String],

},{
  timestamps: true
});

const chipButtonListSchema = new mongoose.Schema({
  
  chipButtonList: [String],
},{
  timestamps: true
});
  
const UniversalModel = mongoose.model('UniversalModel', universalModelSchema);
const Slider = mongoose.model('Slider', sliderSchema);
const ChipButtonList = mongoose.model('ChipButtonList', chipButtonListSchema);

module.exports = { UniversalModel, Slider, ChipButtonList };  