const mongoose = require("mongoose");


const broadcastSchema = new mongoose.Schema({
    broadcastID: {type: String, required: true, unique: true},
    num: {type: String, required: true, maxLength: 10},
    description: {type: String, required: false, maxLength: 2000},
    likes: {type: Number, default: 0},
    comments: {type: Number, default: 0},
    time: {type: String, required: true},
    type: {type: String, required: true},
    dp:{type: String},
    pinned: {type: String}
});

const broadcastLikeSchema = new mongoose.Schema({
    broadcastID: {type: String, required: true}, num: {type: String, required: true, maxLength: 10}
});


const broadcastCommentSchema = new mongoose.Schema({
    broadcastID: {type: String, required: true},
    commentID: {type: String, required: true},
    num: {type: String, required: true, maxLength: 10},
    comment: {type: String, required: true, maxLength: 300},
    replies: {type: Number},
    time: {type: String, required: true}
});

const broadcastCommentReplySchema = new mongoose.Schema({
    broadcastID: {type: String, required: true},
    commentID: {type: String, required: true},
    num: {type: String, required: true, maxLength: 10},
    reply: {type: String, required: true, maxLength: 300},
    time: {type: String, required: true}
});


const BroadcastModel = new mongoose.model("broadcasts", broadcastSchema);
const BroadcastLikeModel = new mongoose.model("broadcast-likes", broadcastLikeSchema);
const BroadcastCommentModel = new mongoose.model("broadcast-comments", broadcastCommentSchema);
const BroadcastCommentReplyModel = new mongoose.model("broadcast-comment-replies", broadcastCommentReplySchema);

module.exports = {
    BroadcastModel, BroadcastLikeModel, BroadcastCommentModel, BroadcastCommentReplyModel
}