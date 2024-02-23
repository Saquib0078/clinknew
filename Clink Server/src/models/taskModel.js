const mongoose = require("mongoose");


const taskSchema = new mongoose.Schema({
    taskName:{type:String,required:true},
    taskDescription:{type:String,required:true},
    time:{type:String,required:true},
    comments: {type: Number, default: 0},
    date: {type: String, required: true},
    imageID: {type: String},
    radioButtonValue: { type: String},
    createdBy:{type: mongoose.Schema.Types.ObjectId,
        ref: 'users'},
        
    status:{type:String,
        default: 'pending'},
        completedUsers: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'users',
            },
          ],

},{
    timestamps: true
});


const taskCommentSchema = new mongoose.Schema({
    taskID: {type: String, required: true},
    commentID: {type: String, required: true},
    num: {type: String, required: true, maxLength: 10},
    comment: {type: String, required: true, maxLength: 300},
    replies: {type: Number},
    time: {type: String, required: true}
});

const taskCommentReplySchema = new mongoose.Schema({
   taskID: {type: String, required: true},
    commentID: {type: String, required: true},
    num: {type: String, required: true, maxLength: 10},
    reply: {type: String, required: true, maxLength: 300},
    time: {type: String, required: true}
});

const TaskCommentModel = new mongoose.model("task-comments", taskCommentSchema);
const TaskReplyModel = new mongoose.model("task-comment-replies", taskCommentReplySchema);
const TaskModel = new mongoose.model("task", taskSchema);
module.exports = {
    TaskCommentModel,TaskReplyModel,TaskModel
}