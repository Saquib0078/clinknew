const mongoose = require("mongoose");
const {getIndianTime} = require("../managers/timeManager");



  
  const notificationSchema = new mongoose.Schema({
    phoneNumbers: [{ type: String }],
    title: {type:String},
    body: {type:String},
    imageUrl: {type:String},
    meetingType: String,
    regTime: {type: String, default: getIndianTime()},
    owner:{type: mongoose.Schema.Types.ObjectId,
        ref: 'users'}

  },{
    timestamps: true
});
  
module.exports = mongoose.model('notificationSchema', notificationSchema);
  