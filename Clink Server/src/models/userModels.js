const mongoose = require("mongoose");
const {getIndianTime} = require("../managers/timeManager");

/** User Schema for OTP */
const temporaryUserSchema = new mongoose.Schema({
    num: {type: String, required: true, trim: true, maxLength: 10, unique: true},
    otp: {type: String, required: true, trim: true},
    time: {type: String, default: getIndianTime(), required: true}
});

/** User Schema for Primary User Information
 * role : 0 -> unspecified , 1 -> user , 2 -> co-admin , 3 -> super-co-admin, 4 -> rejected
 * */
const primaryUserSchema = new mongoose.Schema({
    fName: {type: String, required: true, trim: true, maxLength: 20},
    lName: {type: String, required: true, trim: true, maxLength: 20},
    num: {type: String, required: true, trim: true, maxLength: 10, unique: true},
    role: {type: Number, enum: [0, 1, 2, 3, 4], default: 0},
    regTime: {type: String, default: getIndianTime()},
    FrameName: {type: String, required: false},
    FrameAdd: {type: String, required: false},
    Image: {type: String, required: false},
    /** When User Complete Filling Up the Basic Info Then it will become true  */
    completed: {type: Boolean, required: false, default: true},
    status: {type: String, required: false,default:"Pending"},
    dp: {type: String, required: false},
    // Display picture of user. here we will only store its extension [png,jpg,jpeg]
});

/** User Schema for Basic User Information */
const secondaryUserSchema = new mongoose.Schema({
    Image: {type: String, required: false},
    num: {type: String, required: true, trim: true, maxLength: 10, unique: true}, // Number
    lang: {type: String, required: true, trim: true, maxLength: 20}, // Language
    edu: {type: String, required: true, trim: true, maxLength: 30}, // Education
    intr: {type: String, required: true, trim: true, maxLength: 20}, // Interests
    dist: {type: String, required: true, trim: true, maxLength: 20}, // District
    teh: {type: String, required: true, trim: true, maxLength: 30}, // Tehasil
    vill: {type: String, required: true, trim: true, maxLength: 30}, // Village
    lMark: {type: String, required: true, trim: true, maxLength: 50}, // Land Mark
    ward: {type: String, required: false, trim: true, maxLength: 30}, // Ward
    booth: {type: String, required: false, trim: true, maxLength: 30}, // Booth
    wpn: {type: String, required: true, trim: true, maxLength: 10}, // Whatsapp Number
    insta: {type: String, required: false, trim: true, maxLength: 70}, // Instagram URL
    fb: {type: String, required: false, trim: true, maxLength: 70},
    dob: {type: String, required: false, trim: true},
    bio: {type: String, required: false, trim: true},


    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    } // Facebook URL
});

const TemporaryUserModel = new mongoose.model("user-temps", temporaryUserSchema);
const PrimaryUserModel = new mongoose.model("users", primaryUserSchema);
const SecondaryUserModel = new mongoose.model("user-infos", secondaryUserSchema);

module.exports = {TemporaryUserModel, PrimaryUserModel, SecondaryUserModel};