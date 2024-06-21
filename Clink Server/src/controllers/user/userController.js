const {
  SecondaryUserModel,
  PrimaryUserModel,
} = require("../../models/userModels");
const {
  respondFailed,
  respondSuccess,
  throwError,
} = require("../../managers/responseManager");
const { usersPath } = require("../../managers/fileManager");
const admin = require("firebase-admin");
const notificationModel = require("../../models/notificationModel");
var serviceAccount = require("../../helpers/firebase");

const getUserMedia = (req, res) => {
  let { userId } = req.params;

  if (!userId) {
    return respondFailed(res, "000");
  }
  res.sendFile(usersPath + userId, (err) => {
    if (err) {
      // console.log(err);
      // throwError(res, {
      //     msg: "file not found"
      // });
    }
  });
};

const setUserInfo = async (req, res) => {
  let {
    lang,
    edu,
    intr,
    dist,
    teh,
    vill,
    lMark,
    ward,
    booth,
    wpn,
    insta,
    fb,
    dob,
    gender,
  } = req.body;

  if (!lang || !edu || !intr || !dist || !teh || !vill || !lMark || !wpn) {
    return respondFailed(res, "000");
  }

  let num = req.user.num;

  try {
    let userInfo = await SecondaryUserModel.findOne({ num });

    if (userInfo) {
      await SecondaryUserModel.deleteOne({ num });
    }

    const age = calculateAge(dob);

    let userDoc = new SecondaryUserModel({
      num,
      lang,
      edu,
      intr,
      dist,
      teh,
      vill,
      lMark,
      ward,
      booth,
      wpn,
      insta,
      fb,
      dob,
      age,
      gender,
    });

    await userDoc.save();

    await PrimaryUserModel.updateOne({ num }, { $unset: { completed: "" } });

    respondSuccess(res);
  } catch (e) {
    throwError(res, e);
  }
};

const getuserbyid = async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await PrimaryUserModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ userDataPrimary: userData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    // Extract user ID from request parameters
    const { userId } = req.params;

    // Find the user by ID
    const user = await PrimaryUserModel.findOne({ num: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Lookup additional user information from 'user-infos' collection
    const secondaryUserData = await SecondaryUserModel.findOne({ num: userId });

    if (!secondaryUserData) {
      return res
        .status(404)
        .json({ message: "Additional user information not found" });
    }

    // Merge primary and secondary user data
    const mergedUser = { ...user.toObject(), ...secondaryUserData.toObject() };

    res.json({ status: "success", data: mergedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const UpdateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedFields = req.body;

    const user = await SecondaryUserModel.findByIdAndUpdate(
      userId,
      updatedFields,
      {
        new: true,
        upsert: true,
      }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ status: "success", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const UpdateNameonFrame = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedFields = req.body;
    let Image = req.file.filename;

    if (!userId) {
      return res.status(400).json({ message: "No user Found" });
    }

    const existingData = await PrimaryUserModel.findById(userId);

    if (!existingData) {
      return res.status(404).json({ message: "User not found" });
    }

    const mergedData = { ...existingData.toObject(), ...updatedFields, Image };

    const updateData = await PrimaryUserModel.findByIdAndUpdate(
      userId,
      mergedData,
      {
        new: true,
        upsert: true,
      }
    );

    res.status(200).json({ status: "success", data: updateData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const UpdateUserPrimary = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedFields = req.body;
    const dp = req.file;

    const user = await PrimaryUserModel.findByIdAndUpdate(
      userId,
      updatedFields,
      {
        new: true,
        upsert: true,
      }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if dp is provided in the request
    if (dp) {
      user.dp = dp.filename;
      console.log(dp);
    }

    // Save the updated user
    const updatedUser = await user.save();

    res.json({ status: "success", data: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUSers = async (req, res) => {
  try {
    const filter = {};

    // Check each query parameter and add it to the filter if provided
    if (req.query.num) filter.num = new RegExp(req.query.num, "i");
    if (req.query.lang) filter.lang = new RegExp(req.query.lang, "i");
    if (req.query.edu) filter.edu = new RegExp(req.query.edu, "i");
    if (req.query.intr) filter.intr = new RegExp(req.query.intr, "i");
    if (req.query.dist) filter.dist = new RegExp(req.query.dist, "i");
    if (req.query.teh) filter.teh = new RegExp(req.query.teh, "i");
    if (req.query.vill) filter.vill = new RegExp(req.query.vill, "i");
    if (req.query.lMark) filter.lMark = new RegExp(req.query.lMark, "i");
    if (req.query.ward) filter.ward = new RegExp(req.query.ward, "i");
    if (req.query.booth) filter.booth = new RegExp(req.query.booth, "i");
    if (req.query.wpn) filter.wpn = new RegExp(req.query.wpn, "i");

    const pipeline = [];

    // Stage 1: Match documents based on the filter criteria
    if (Object.keys(filter).length > 0) {
      pipeline.push({
        $match: filter,
      });
    }

    // Stage 2: Project fields and add a new field "source" to identify the source schema
    pipeline.push({
      $project: {
        _id: 1,
        num: 1,
        fName: 1,
        lName: 1,
        role: 1,
        regTime: 1,
        FrameName: 1,
        FrameAdd: 1,
        Image: 1,
        fcmToken: 1,
        completed: 1,
        status: 1,
        dp: 1,
        source: "primary",
      },
    });

    // Stage 3: Append users from the secondary schema
    pipeline.push({
      $unionWith: {
        coll: "user-infos", // Replace with the actual collection name for the secondary schema
        pipeline: [
          // Project fields and add a new field "source" to identify the source schema
          {
            $project: {
              _id: 0,
              num: 1,
              Image: 1,
              lang: 1,
              edu: 1,
              intr: 1,
              dist: 1,
              teh: 1,
              vill: 1,
              lMark: 1,
              ward: 1,
              booth: 1,
              wpn: 1,
              insta: 1,
              fb: 1,
              dob: 1,
              owner: 1,
              source: "secondary",
            },
          },
        ],
      },
    });

    // Stage 4: Group users by mobile number and merge the fields
    pipeline.push({
      $group: {
        _id: "$num",
        data: {
          $mergeObjects: "$$ROOT",
        },
      },
    });

    // Stage 5: Replace the "_id" with "num" in the final result
    pipeline.push({
      $replaceRoot: { newRoot: "$data" },
    });

    const users = await PrimaryUserModel.aggregate(pipeline);

    res.json({ data: users });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const getUser = async (req, res) => {
  try {
    const user = await PrimaryUserModel.find({ status: "Pending" });
    if (!user) return res.status(400).send("no users found");

    return res.status(200).json({ status: "success", user: user });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const getUserAll = async (req, res) => {
  try {
    const user = await PrimaryUserModel.find();
    if (!user) return res.status(400).send("no users found");

    return res.status(200).json({ status: "success", user: user });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const getUserAccepted = async (req, res) => {
  try {
    const user = await PrimaryUserModel.find({ status: "Accepted" });
    if (!user) return res.status(400).send("no users found");

    return res.status(200).json({ status: "success", user: user });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const getUserRejected = async (req, res) => {
  try {
    const user = await PrimaryUserModel.find({ status: "Rejected" });
    if (!user) return res.status(400).send("no users found");

    return res.status(200).json({ status: "success", user: user });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const queryUsers = async (req, res) => {
  try {
    const filter = {};

    // Check each query parameter and add it to the filter if provided
    if (req.query.fName) filter.fName = new RegExp(req.query.fName, "i");
    if (req.query.lName) filter.lName = new RegExp(req.query.lName, "i");

    const users = await PrimaryUserModel.find(filter);
    res.json({ queryUser: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const SendNotification = async (req, res) => {
  try {
    let { phoneNumbers, title, body,meetingType } = req.body;

    const owner = req.user._id;
    const image = req.file.filename;

    console.log(req.body);
    console.log(phoneNumbers.phoneNumbers);

    // phoneNumbers=phoneNumbers["phoneNumbers"]

    const imageUrl = `http://192.168.1.10:3000/user/getUsermedia/${image}`;

    console.log(imageUrl);
    if (!phoneNumbers || !title || !body || !meetingType) {
      return res.status(400).json({ error: "Invalid request parameters" });
    }

    // Ensure phoneNumbers is an array of strings

    if (!Array.isArray(phoneNumbers)) {
      phoneNumbers = [phoneNumbers];
      return res.status(400).json({ error: "Invalid phoneNumbers format" });
    }
    const allowedMeetingTypes = ['meeting', 'task'];
if (!allowedMeetingTypes.includes(meetingType)) {
  return res.status(400).json({ error: "Invalid meetingType value" });
}

    // Iterate through each phone number and send a notification to the corresponding topic
    for (const phoneNumber of phoneNumbers) {
      const topic = phoneNumber.replaceAll('"', "");
      if (typeof phoneNumbers === "string") {
        phoneNumbers = [phoneNumbers];
      }
      console.log(topic);

      const message = {
        notification: {
          title,
          body,
        },
        data: {
          imageUrl,
          meetingType,
        },
        topic,
      };

      await admin.messaging().send(message);
    }

    const notificationId = `${title}-${body}-${Date.now()}`;

    // Create a new document for the notification
    const newNotification = await notificationModel.create({
      notificationId,
      title,
      body,
      phoneNumbers,
      owner,
      imageUrl,
      meetingType
    });

    console.log("Notifications sent successfully");
    return res.json({
      success: true,
      message: "Notifications sent successfully",
    });
  } catch (error) {
    console.error("Error sending notifications:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getNotification = async (req, res) => {
  try {
    const userPhoneNumber = req.user.num; // Replace this with the actual user's phone number
    const notifications = await notificationModel
      .find({
        phoneNumbers: userPhoneNumber,
      })
      .sort({ createdAt: -1 });

    return res.json({ status: "success", notification: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getMergedUsers = async (req, res) => {
  try {
    // Extract query parameters from request
    const { dist, teh, vill, booth, minAge, maxAge, date, gender } = req.query;

    // Build the match object based on the provided query parameters
    const match = {};
    if (dist) match["secondaryData.dist"] = dist;
    if (teh) match["secondaryData.teh"] = teh;
    if (vill) match["secondaryData.vill"] = vill;
    if (booth) match["secondaryData.booth"] = booth;
    if (gender) match["secondaryData.gender"] = gender;

    // if (minAge) match["secondaryData.age"] = minAge;
    // if (maxAge) match["secondaryData.age"] = maxAge;
    if (date) {
      const [month, day] = date.split('/'); // Assuming the date is in the format "MM/DD"
      match["$expr"] = {
          $and: [
              { $eq: [{ $month: "$secondaryData.dob" }, parseInt(month)] },
              { $eq: [{ $dayOfMonth: "$secondaryData.dob" }, parseInt(day)] }
          ]
      };
  }
  

    if (minAge || maxAge) {
      match["secondaryData.age"] = {};
      if (minAge) match["secondaryData.age"]["$gte"] = minAge.toString();
      if (maxAge) match["secondaryData.age"]["$lte"] = maxAge.toString();
    }
    console.log("Match Object:", match);

    // Aggregate query with $match stage for filtering
    const mergedResults = await PrimaryUserModel.aggregate([
      {
        $lookup: {
          from: "user-infos", // Collection name for SecondaryUser model
          localField: "num", // Field in PrimaryUser to match
          foreignField: "num", // Field in SecondaryUser to match
          as: "secondaryData", // Output array field name
        },
      },
      {
        $match: match, // Apply filtering based on query parameters
      },
      {
        $replaceWith: {
          $mergeObjects: [{ $arrayElemAt: ["$secondaryData", 0] }, "$$ROOT"],
        },
      },
      {
        $project: { secondaryData: 0 }, // Remove the secondaryData field
      },
    ]);

    res.json({ mergedUsers: mergedResults });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const id = req.params.id;
    const finduser = await PrimaryUserModel.findOne({ num: id });

    if (!finduser) return res.status(404).json({ message: "No user found" });
    const findsecondary = await SecondaryUserModel.findOne({ num: id });
    if (!findsecondary)
      return res.status(404).json({ message: "No user found" });

    return res.status(200).json({ user: finduser, findNum: findsecondary });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const TotalUsers = async (req, res) => {
  try {
    const user = await PrimaryUserModel.countDocuments();
    if (!user) {
      return "No Users Found";
    }

    return res.status(200).json({ totalusers: user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const UsersByDist = async (req, res) => {
  try {
    const counts = await SecondaryUserModel.aggregate([
      {
        $group: {
          _id: {
            district: "$dist",
            tehsil: "$teh",
            village: "$vill",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const result = counts.map((item) => ({
      district: item._id.district,
      tehsil: item._id.tehsil,
      village: item._id.village,
      count: item.count,
    }));

    res.status(200).json({ result: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: error.message });
  }
};

const getNetworkUser = async (req, res) => {
  try {
    const id = req.params.id;
    const finduser = await PrimaryUserModel.findById(id);

    console.log(finduser.num);
    if (!finduser) return res.status(404).json({ message: "No user found" });
    const findsecondary = await SecondaryUserModel.findOne({
      num: finduser.num,
    });
    if (!findsecondary)
      return res.status(404).json({ message: "No user found" });

    return res.status(200).json({ user: finduser, findNum: findsecondary });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

function calculateAge(dob) {
  const dobParts = dob.split("/");
  const userDob = new Date(dobParts[2], dobParts[1] - 1, dobParts[0]); // Months are zero-based
  const today = new Date();

  let age = today.getFullYear() - userDob.getFullYear();
  const monthDiff = today.getMonth() - userDob.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < userDob.getDate())
  ) {
    age--;
  }

  return age;
}

module.exports = {
  setUserInfo,
  getUserById,
  queryUsers,
  UpdateUser,
  UpdateUserPrimary,
  getUSers,
  UpdateNameonFrame,
  SendNotification,
  getNotification,
  getUser,
  getUserAccepted,
  getUserRejected,
  getUserAll,
  getMergedUsers,
  getUserMedia,
  getuserbyid,
  getUsers,
  getNetworkUser,
  TotalUsers,
  UsersByDist,
};
