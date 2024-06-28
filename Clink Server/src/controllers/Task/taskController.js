const {taskPath} = require("../../managers/fileManager");
const {PrimaryUserModel}=require('../../models/userModels')
const{TaskReplyModel,TaskCommentModel,TaskModel}=require('../../models/taskModel')
const {respondSuccess, respondSuccessWithData, throwError, respondFailed} = require("../../managers/responseManager");
const {generateRandomID} = require("../../helpers/appHelper");
const {getIndianTime} = require("../../managers/timeManager");
const BROADCAST_LIMIT = 10;
const BROADCAST_COMMENTS_LIMIT = 10;
const BROADCAST_COMMENTS_REPLY_LIMIT = 10;


const CreateTask = async (req, res) => {
    const {taskName,taskDescription, time, date,radioButtonValue,taskUrl } = req.body;
    const imageID=req.file;
    try {
        // if (!taskName|| !taskDescription || !time || !date||!imageID) {
        //     return res.status(400).send("Data should not be empty");
        // }
      const userid=req.user._id
        const taskDetails = {
           taskName,
           taskDescription,
            date,
            time,
            taskUrl,
            radioButtonValue,
            imageID:imageID.filename,
            createdBy:userid

        };

        const createtask = await TaskModel.create(taskDetails);
        return res.status(200).json({ status: "success", data: createtask,id:createtask._id });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

  const completedTask=async(req,res)=>{
    try {
        const taskId = req.params.taskId;
        const userId = req.body.userId;
    
        if (!userId) {
          return res.status(400).json({ error: 'Invalid or missing user ID in the request body' });
        }
    
        const task = await TaskModel.findByIdAndUpdate(
          taskId,
          { $addToSet: { completedUsers: userId } },
          { new: true }
        );
    
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }
    
        res.status(200).json({status:"success",data:task});
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    
  }

  const getCompletedUSers=async (req,res)=>{
    try {
        const taskId = req.params.taskId;
        const task = await TaskModel.findById(taskId).populate('completedUsers');
    
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }
    
        // Extract user IDs from completedUsers array
        const userIds = task.completedUsers.map(user => user._id);
    
        // Fetch user details based on user IDs
        const users = await PrimaryUserModel.find({ _id: { $in: userIds } });
    
        // Create a new object with task details and associated user details
        // const taskWithUsers = {
        //   taskDetails: task,
        // };
    
        res.status(200).json({status:"success",task});
      } catch (error) {
        console.error(error);
        res.status(500).json({ error:error.message});
      }
    
  }


// GET /api/livetaskings
const updateTask = async (req, res) => {
  
        try {
            const id = req.params.id;
            const { taskName, taskDescription, time, date,taskUrl } = req.body;
            let image;
    
            if (req.file) {
                image = req.file.filename; // or req.file.path, depending on how you store files
            }
    
            // Fetch the existing tasking
            const existingtask = await TaskModel.findById(id);
            if (!existingtask) {
                return res.status(404).json({ error: 'tasking not found' });
            }
            // Update fields with new values or retain existing ones
            const updateFields = {
                taskName: taskName || existingtask.taskName,
                taskDescription: taskDescription || existingtask.taskDescription,
                time: time || existingtask.time,
                date: date || existingtask.date,
                taskUrl: taskUrl || existingtask.taskUrl,
                imageID: image || existingtask.imageID
            };

    
            const updatedtask = await TaskModel.findByIdAndUpdate(id, updateFields, { new: true });
    
            return res.json({ status: "success", data: updatedtask });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    
};

// POST /api/jointasking
const deleteTask=async (req, res) => {
    try {
        const deletedtask = await TaskModel.findByIdAndRemove(req.params.id);
    
        if (deletedtask) {
          return res.json({ status: "success", data: deletedtask });
        } else {
          return res.status(404).json({ error: 'tasking not found' });
        }
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
  
};


const getTaskImage = (req, res) => {
  let {broadcastMediaID} = req.params;

  if (!broadcastMediaID) {
      return respondFailed(res, "000");
  }
  res.sendFile(taskPath + broadcastMediaID, (err) => {
      if (err) {
          // console.log(err);
          // throwError(res, {
          //     msg: "file not found"
          // });
      }
  });
}

const getTask=async(req,res)=>{

    try {
        const taskings = await TaskModel.find().sort({ createdAt: -1 });
        return res.json({ status: "success",task:taskings });
    } catch (error) {
        return res.status(500).json({ error: error.message });
      }
}

const getTaskById=async(req,res)=>{
    try {
        const tasking = await TaskModel.findById(req.params.id);
    
        if (tasking) {
          return res.json(tasking);
        } else {
          return res.status(404).json({ error: 'Task not found' });
        }
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
}


const commentTask = async (req, res) => {
    const { comment, taskID } = req.body;
    const num = req.user.num;
    
    const commentID = generateRandomID();
    const time = getIndianTime();
    
    const findTask = await TaskModel.findById(taskID);
    if (!findTask) return res.json({ message: "No task found" });
    
    // Use the MongoDB document _id for the update query
    const taskId = findTask._id;
    
    // Increment the comments field
    await TaskModel.updateOne({ _id: taskId }, { $inc: { comments: 1 } });
    
    const commentDoc = new TaskCommentModel({
        taskID: taskId,  // Use the MongoDB document _id here
        commentID,
        num,
        comment,
        time,
    });
    
    await commentDoc.save();
    
    respondSuccessWithData(res, {
        commentID,
        time,
    });
    }
const replyCommentTask = async (req, res) => {
    let {reply, commentID, taskID} = req.body;
    let num = req.user.num;

    let time = getIndianTime();
    let replyDoc = new TaskReplyModel({
        taskID, commentID, num, reply, time
    });

    await replyDoc.save();

    await TaskCommentModel.updateOne({taskID, commentID: commentID}, {$inc: {replies: 1}})

    respondSuccessWithData(res, {
        time
    });
}

const deleteCommentTask = async (req, res) => {
    let {commentID, taskID} = req.params;

    await TaskModel.updateOne({taskID}, {$inc: {comments: -1}})
    await TaskCommentModel.deleteOne({taskID, commentID});
    await TaskCommentModel.deleteMany({taskID, commentID});

    respondSuccess(res);

}

const getTaskComments = async (req, res) => {
    let {taskID, skip} = req.params;

    let comments = [];

    let comment = await TaskCommentModel.find({taskID}).sort({_id: -1}).skip(skip).limit(BROADCAST_COMMENTS_LIMIT);

    let userProfiles = {};

    if (comment) {
        for (let i = 0; i < comment.length; i++) {
            let commenterNumber = comment[i].num;
            let userProfile;
            if (userProfiles.hasOwnProperty(commenterNumber)) {
                userProfile = userProfiles[commenterNumber];
            } else {
                userProfile = await PrimaryUserModel.findOne({num: commenterNumber});
                userProfile = userProfile.toObject();
                userProfiles[commenterNumber] = userProfile;
            }
            if (!userProfile) {
                continue;
            }
            if (userProfile.hasOwnProperty("status") && userProfile.status === "banned") {
                continue;
            }
            comments.push({
                commentID: comment[i].commentID,
                num: comment[i].num,
                comment: comment[i].comment,
                replies: comment[i].replies,
                time: comment[i].time,
                username: userProfile["fName"] + " " + userProfile["lName"],
                profileDP: userProfile["dp"]

            });
        }
    }
    respondSuccessWithData(res, comments);
}

const getTaskCommentReplies = async (req, res) => {
    let {taskID, commentID, skip} = req.params;

    let comments = [];

    let comment = await TaskReplyModel.find({
        taskID, commentID
    }).skip(skip).limit(BROADCAST_COMMENTS_REPLY_LIMIT);

    let userProfiles = {};

    if (comment) {
        for (let i = 0; i < comment.length; i++) {
            let commenterNumber = comment[i].num;
            let userProfile;
            if (userProfiles.hasOwnProperty(commenterNumber)) {
                userProfile = userProfiles[commenterNumber];
            } else {
                userProfile = await PrimaryUserModel.findOne({num: commenterNumber});
                userProfile = userProfile.toObject();
                userProfiles[commenterNumber] = userProfile;
            }
            if (!userProfile) {
                continue;
            }
            if (userProfile.hasOwnProperty("status") && userProfile.status === "banned") {
                continue;
            }
            comments.push({
                num: comment[i].num,
                reply: comment[i].reply,
                time: comment[i].time,
                username: userProfile["fName"] + " " + userProfile["lName"],
                profileDP: userProfile["dp"]
            });
        }
    }
    respondSuccessWithData(res, comments);
}


module.exports={CreateTask,getTask,getTaskById,updateTask,deleteTask,getTaskImage,completedTask,getCompletedUSers,commentTask,replyCommentTask,deleteCommentTask,getTaskCommentReplies,getTaskComments}
