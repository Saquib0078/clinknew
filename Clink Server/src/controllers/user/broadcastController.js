const {
  BroadcastModel,
  BroadcastLikeModel,
  BroadcastCommentModel,
  BroadcastCommentReplyModel,
} = require("../../models/broadcastModels");
const {
  respondSuccess,
  respondSuccessWithData,
  throwError,
  respondFailed,
} = require("../../managers/responseManager");
const { PrimaryUserModel } = require("../../models/userModels");
const {
  deleteBroadcastImage,
  broadcastsPath,
  usersPath,
} = require("../../managers/fileManager");
const { generateRandomID } = require("../../helpers/appHelper");
const { getIndianTime } = require("../../managers/timeManager");
const BROADCAST_LIMIT = 10;
const BROADCAST_COMMENTS_LIMIT = 10;
const BROADCAST_COMMENTS_REPLY_LIMIT = 10;
const admin = require("firebase-admin");

var serviceAccount = require("../../helpers/firebase");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const getBroadcastMedia = (req, res) => {
  let { broadcastMediaID } = req.params;

  if (!broadcastMediaID) {
    return respondFailed(res, "000");
  }

  res.sendFile(usersPath + broadcastMediaID, (err) => {
    if (err) {
      // console.log(err);
      // throwError(res, {
      //     msg: "file not found"
      // });
    }
  });
};

const publishBroadcast = (req, res) => {
  let {id, type, description} = req.body;
  let num = req.user.num;

  let broadcast = new BroadcastModel({
      broadcastID: id, num, description, type, time: getIndianTime()
  });
  broadcast.save();

  respondSuccess(res)
}


const updateBroadcast = async (req, res) => {
  try {
      const id = req.params.broadcastID;
      const { broadcastName, description, broadcastTime, broadcastDate,broadcastUrl } = req.body;
      let image;

      if (req.file) {
          image = req.file.filename; 
      }

      // Fetch the existing broadcast
      const existingBroadcast = await BroadcastModel.findOne({broadcastID:id});
      if (!existingBroadcast) {
          return res.status(404).json({ error: 'Broadcast not found' });
      }

      // Update fields with new values or retain existing ones
      const updateFields = {
          broadcastName: broadcastName || existingBroadcast.broadcastName,
          description: description || existingBroadcast.description,
          broadcastTime: broadcastTime || existingBroadcast.broadcastTime,
          broadcastDate: broadcastDate || existingBroadcast.broadcastDate,
          broadcastID: image || existingBroadcast.broadcastID,
          broadcastUrl:broadcastUrl||existingBroadcast.broadcastUrl
      };

      const updatedBroadcast = await BroadcastModel.findOneAndUpdate({broadcastID:id}, updateFields, { new: true });

      return res.json({ status: "success", data: updatedBroadcast });
  } catch (error) {
      return res.status(500).json({ error: error.message });
  }
};


const getBroadcastById = async (req, res) => {
  try {
    const broadcastId = req.params.broadcastID;
    
    let broadcast = await BroadcastModel.findOne({ broadcastID: broadcastId });
if (!broadcast) {
  broadcast = await BroadcastModel.findById(broadcastId);
}
    
    if (!broadcast) {
      return res.status(404).json({ message: 'Broadcast not found' });
    }
    
    res.status(200).json(broadcast);
  } catch (error) {
    console.error('Error fetching broadcast:', error);
    res.status(500).json({ message: error.message });
  }
};


const getBroadcast = async (req, res) => {
  let { skip } = req.params;
  let num = req.user.num;

  let broadcasts = await BroadcastModel.find()
    .sort({ _id: -1 })
    .skip(skip)
    .limit(BROADCAST_LIMIT);

  let broadcastList = [];
  let pinnedBroadcasts = [];
  let userProfiles = {};

  for (let i = 0; i < broadcasts.length; i++) {
    let publisherNumber = broadcasts[i].num;
    let userProfile;
    if (userProfiles.hasOwnProperty(publisherNumber)) {
      userProfile = userProfiles[publisherNumber];
    } else {
      userProfile = await PrimaryUserModel.findOne({ num: publisherNumber });
      userProfiles[publisherNumber] = userProfile;
    }
    if (userProfile) {
      let broadcast = broadcasts[i].toObject();
      let isLiked = await BroadcastLikeModel.findOne({
        broadcastID: broadcasts[i]["broadcastID"],
        num,
      });

      // delete broadcast["_id"];
      delete broadcast["__v"];

      broadcast.isLiked = !!isLiked;
      broadcast.username = userProfile["fName"] + " " + userProfile["lName"];
      broadcast.profileDP = userProfile["dp"];
        
      if (broadcast.hasOwnProperty("pinned")) {
        pinnedBroadcasts.push(broadcast);
        continue;
      }

      broadcastList.push(broadcast);
    }
  }

  pinnedBroadcasts.sort(
    (item1, item2) => new Date(item1.pinned) - new Date(item2.pinned)
  );

  respondSuccessWithData(res, pinnedBroadcasts.concat(broadcastList));
};

const pinBroadcast = async (req, res) => {
  let { broadcastID } = req.params;

  if (!req.user.isAdmin) {
    return respondSuccess(res);
  }

  await BroadcastModel.updateOne(
    { broadcastID },
    { $set: { pinned: new Date().toISOString() } }
  );

  respondSuccess(res);
};

const unpinBroadcast = async (req, res) => {
  let { broadcastID } = req.params;

  if (!req.user.isAdmin) {
    return respondSuccess(res);
  }

  await BroadcastModel.updateOne({ broadcastID }, { $unset: { pinned: "" } });

  respondSuccess(res);
};

const likeBroadcast = async (req, res) => {
  let { broadcastID } = req.params;
  let num = req.user.num;

  try {
    let isAlreadyLiked = await BroadcastLikeModel.findOne({ num, broadcastID });

    if (isAlreadyLiked) {
      return respondSuccess(res);
    }

    await BroadcastModel.updateOne({ broadcastID }, { $inc: { likes: 1 } });

    let model = new BroadcastLikeModel({
      num,
      broadcastID,
    });
    await model.save();

    return respondSuccess(res);
  } catch (err) {
    throwError(res, err);
  }
};
const removeLikeBroadcast = async (req, res) => {
  let { broadcastID } = req.params;
  let num = req.user.num;

  try {
    await BroadcastModel.updateOne({ broadcastID }, { $inc: { likes: -1 } });

    await BroadcastLikeModel.deleteOne({ broadcastID, num });

    return respondSuccess(res);
  } catch (err) {
    throwError(res, err);
  }
};

const deleteBroadcast = async (req, res) => {
  let { broadcastID } = req.params;
  let num = req.user.num;

  if (!req.user.isAdmin) {
    return respondSuccess(res);
  }

  let broadcast = await BroadcastModel.findOne({ broadcastID, num });

  if (!broadcast) {
    return respondSuccess(res);
  }

  await BroadcastModel.deleteOne({ broadcastID });
  await BroadcastLikeModel.deleteMany({ broadcastID });
  await BroadcastCommentModel.deleteMany({ broadcastID });
  await BroadcastCommentReplyModel.deleteMany({ broadcastID });

  deleteBroadcastImage(broadcastID, broadcast.type, () => {
    return respondSuccess(res);
  });
};

const getBroadcastComments = async (req, res) => {
  let { broadcastID, skip } = req.params;

  let comments = [];

  let comment = await BroadcastCommentModel.find({ broadcastID })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(BROADCAST_COMMENTS_LIMIT);

  let userProfiles = {};

  if (comment) {
    for (let i = 0; i < comment.length; i++) {
      let commenterNumber = comment[i].num;
      let userProfile;
      if (userProfiles.hasOwnProperty(commenterNumber)) {
        userProfile = userProfiles[commenterNumber];
      } else {
        userProfile = await PrimaryUserModel.findOne({ num: commenterNumber });
        userProfile = userProfile.toObject();
        userProfiles[commenterNumber] = userProfile;
      }
      if (!userProfile) {
        continue;
      }
      if (
        userProfile.hasOwnProperty("status") &&
        userProfile.status === "banned"
      ) {
        continue;
      }
      comments.push({
        commentID: comment[i].commentID,
        num: comment[i].num,
        comment: comment[i].comment,
        replies: comment[i].replies,
        time: comment[i].time,
        username: userProfile["fName"] + " " + userProfile["lName"],
        profileDP: userProfile["dp"],
      });
    }
  }
  respondSuccessWithData(res, comments);
};

const getBroadcastCommentReplies = async (req, res) => {
  let { broadcastID, commentID, skip } = req.params;

  let comments = [];

  let comment = await BroadcastCommentReplyModel.find({
    broadcastID,
    commentID,
  })
    .skip(skip)
    .limit(BROADCAST_COMMENTS_REPLY_LIMIT);

  let userProfiles = {};

  if (comment) {
    for (let i = 0; i < comment.length; i++) {
      let commenterNumber = comment[i].num;
      let userProfile;
      if (userProfiles.hasOwnProperty(commenterNumber)) {
        userProfile = userProfiles[commenterNumber];
      } else {
        userProfile = await PrimaryUserModel.findOne({ num: commenterNumber });
        userProfile = userProfile.toObject();
        userProfiles[commenterNumber] = userProfile;
      }
      if (!userProfile) {
        continue;
      }
      if (
        userProfile.hasOwnProperty("status") &&
        userProfile.status === "banned"
      ) {
        continue;
      }
      comments.push({
        num: comment[i].num,
        reply: comment[i].reply,
        time: comment[i].time,
        username: userProfile["fName"] + " " + userProfile["lName"],
        profileDP: userProfile["dp"],
      });
    }
  }
  respondSuccessWithData(res, comments);
};

const commentBroadcast = async (req, res) => {
  let { comment, broadcastID } = req.body;
  let num = req.user.num;
  console.log(req.user);
  let commentID = generateRandomID();
  let time = getIndianTime();
  let commentDoc = new BroadcastCommentModel({
    broadcastID,
    commentID,
    num,
    comment,
    time,
  });

  await commentDoc.save();
  await BroadcastModel.updateOne({ broadcastID }, { $inc: { comments: 1 } });

  respondSuccessWithData(res, {
    commentID,
    time,
  });
};
const replyCommentBroadcast = async (req, res) => {
  let { reply, commentID, broadcastID } = req.body;
  let num = req.user.num;

  let time = getIndianTime();
  let replyDoc = new BroadcastCommentReplyModel({
    broadcastID,
    commentID,
    num,
    reply,
    time,
  });

  await replyDoc.save();

  await BroadcastCommentModel.updateOne(
    { broadcastID, commentID: commentID },
    { $inc: { replies: 1 } }
  );

  respondSuccessWithData(res, {
    time,
  });
};

const deleteCommentBroadcast = async (req, res) => {
  let { commentID, broadcastID } = req.params;

  await BroadcastModel.updateOne({ broadcastID }, { $inc: { comments: -1 } });
  await BroadcastCommentModel.deleteOne({ broadcastID, commentID });
  await BroadcastCommentReplyModel.deleteMany({ broadcastID, commentID });

  respondSuccess(res);
};

module.exports = {
  getBroadcastMedia,
  publishBroadcast,
  getBroadcast,
  pinBroadcast,
  unpinBroadcast,
  likeBroadcast,
  removeLikeBroadcast,
  deleteBroadcast,
  getBroadcastComments,
  getBroadcastCommentReplies,
  commentBroadcast,
  replyCommentBroadcast,
  deleteCommentBroadcast,
  updateBroadcast,
  getBroadcastById
};
