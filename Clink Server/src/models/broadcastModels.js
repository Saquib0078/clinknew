const mongoose = require("mongoose");


const broadcastSchema = new mongoose.Schema({
    broadcastID: {type: String},  // Changed to array of strings
    num: {type: String, required: true, maxLength: 10},
    description: {type: String, required: false},
    likes: {type: Number, default: 0},
    comments: {type: Number, default: 0},
    time: {type: String, required: true},
    type: {type: String, required: true},
    dp:{type: String},
    pinned: {type: String},
    broadcastUrl: {type: String,default:""},

});

const broadcastLikeSchema = new mongoose.Schema({
    broadcastID: {type: String, required: true}, num: {type: String, required: true, maxLength: 10}
});


const broadcastCommentSchema = new mongoose.Schema({
    broadcastID: {type: String, required: true},
    commentID: {type: String, required: true},
    num: {type: String, required: true, maxLength: 10},
    comment: {type: String, required: true, maxLength: 2000},
    replies: {type: Number},
    time: {type: String, required: true}
});

const broadcastCommentReplySchema = new mongoose.Schema({
    broadcastID: {type: String, required: true},
    commentID: {type: String, required: true},
    num: {type: String, required: true, maxLength: 10},
    reply: {type: String, required: true, maxLength: 2000},
    time: {type: String, required: true}
});


const BroadcastModel = new mongoose.model("broadcasts", broadcastSchema);
const BroadcastLikeModel = new mongoose.model("broadcast-likes", broadcastLikeSchema);
const BroadcastCommentModel = new mongoose.model("broadcast-comments", broadcastCommentSchema);
const BroadcastCommentReplyModel = new mongoose.model("broadcast-comment-replies", broadcastCommentReplySchema);

module.exports = {
    BroadcastModel, BroadcastLikeModel, BroadcastCommentModel, BroadcastCommentReplyModel
}