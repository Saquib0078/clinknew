const mongoose = require("mongoose");



  
  const universalModelSchema = new mongoose.Schema({
    title: String,
    type: String,
    graphicModelList: [{ _id: String,filename:String}],
  },{
    timestamps: true
});

const sliderSchema = new mongoose.Schema({
 
  slider: { type: String, required: true }
},{
  timestamps: true
});

const chipButtonListSchema = new mongoose.Schema({
  
  chipButtonList:{ type: String}
},{
  timestamps: true
});
  
const UniversalModel = new mongoose.model("UniversalModel", universalModelSchema);
const SliderSchema = new mongoose.model("Slider", sliderSchema);
const ChipButtonListSchema = new mongoose.model("ChipButtonList", chipButtonListSchema);






module.exports = { UniversalModel, SliderSchema, ChipButtonListSchema };  