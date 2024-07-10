const mongoose = require("mongoose");


const meetSchema = new mongoose.Schema({
    meetName:{type:String},
    meetDescription:{type:String},
    time:{type:String},
    date: {type: String},
    radioButtonValue: { type: String},
    imageID: {type: String},
    live: {type: Boolean, default: false},
    createdBy:{type: mongoose.Schema.Types.ObjectId,
        ref: 'users'}

},{
    timestamps: true
});


module.exports = mongoose.model("meeting", meetSchema);