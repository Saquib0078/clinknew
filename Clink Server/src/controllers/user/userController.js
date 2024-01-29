const {SecondaryUserModel, PrimaryUserModel} = require("../../models/userModels");
const {respondFailed, respondSuccess, throwError} = require("../../managers/responseManager");
const { usersPath } = require("../../managers/fileManager");
const admin = require('firebase-admin');

var serviceAccount = require("../../helpers/c-link-46f11-firebase-adminsdk-xzkke-7a6247f4e9.json");
const { Token } = require("aws-sdk/lib/token");
const { use } = require("../../routes/userRoutes");


const setUserInfo = async (req, res) => {
    let {lang, edu, intr, dist, teh, vill, lMark, ward, booth, wpn, insta, fb,dob} = req.body;

    if (!lang || !edu || !intr || !dist || !teh || !vill || !lMark || !wpn) {
        return respondFailed(res, "000");
    }

    let num = req.user.num;

    try {
        let userInfo = await SecondaryUserModel.findOne({num})

        if (userInfo) {
            await SecondaryUserModel.deleteOne({num});
        }

        let userDoc = new SecondaryUserModel({
            num, lang, edu, intr, dist, teh, vill, lMark, ward, booth, wpn, insta, fb,dob
        });

        await userDoc.save();

        await PrimaryUserModel.updateOne({num}, {$unset: {completed: ''}});

        respondSuccess(res);


    } catch (e) {
        throwError(res, e)
    }

}


const getUserById=async(req,res)=>{
const userId=req.params.userId;
try {
    const findUser=await PrimaryUserModel.findById(userId)
    if(!findUser){
        return respondFailed(res, "000");
}
const mobile=findUser.num;
const findNum = await SecondaryUserModel.findOne({ num:mobile });
if(!findNum){
    return res.status(400).send("no User found")
}
  return res.status(200).json({status:'success',data:findUser,findNum})

} catch (error) {
    return res.status(500).json({error:error.message})

}


}

const UpdateUser=async(req,res)=>{
    try {
        const userId = req.params.id;
        const updatedFields = req.body; 

        // const find=SecondaryUserModel.findById({_id:userId})

        // if(!find) return res.status(400).send('no user found')
          
        // updatedFields.Image = Image;

    
        const user = await SecondaryUserModel.findByIdAndUpdate(userId, updatedFields, {
          new: true,
          upsert: true,
        });
         
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        res.json({ status: 'success', data: user });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }


}

const getBroadcastMedia = (req, res) => {
  let {broadcastMediaID} = req.params;

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
}


const UpdateNameonFrame=async(req,res)=>{
  try {
    const userId=req.params.id
    const updatedFields=req.body;
    let Image=req.file.filename
    if (!userId) {
      return res.status(400).json({message:"No user Found"})
    }
    

    updatedFields.Image = Image;

    const updateData=await PrimaryUserModel.findByIdAndUpdate(userId,updatedFields,{
      new: true,
      upsert: true,
    })
    res.status(200).json({ status: 'success', data: updateData });
  
  
  } catch (error) {
    res.status(500).json({ error: error.message });

  }
  
  
  }

const UpdateUserPrimary=async(req,res)=>{
    try {
        const userId = req.params.id;
        const updatedFields = req.body; 
    
        const user = await PrimaryUserModel.findByIdAndUpdate(userId, updatedFields, {
          new: true,
          upsert: true,
        });
         
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        res.json({ status: 'success', data: user });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }


}

const getUSers=async(req,res)=>{
    try {
        const findUsers=await PrimaryUserModel.find()
        if(!findUsers) return res.status(400).json({error:"No User found"})
       
        return res.status(200).json({data:findUsers})

    } catch (error) {
        
    }
}

const queryUsers=async (req, res) => {
    try {
      const filter = {};
      
      // Check each query parameter and add it to the filter if provided
      if (req.query.num) filter.num = new RegExp(req.query.num, 'i');
      if (req.query.lang) filter.lang = new RegExp(req.query.lang, 'i');
      if (req.query.edu) filter.edu = new RegExp(req.query.edu, 'i');
      if (req.query.intr) filter.intr = new RegExp(req.query.intr, 'i');
      if (req.query.dist) filter.dist = new RegExp(req.query.dist, 'i');
      if (req.query.teh) filter.teh = new RegExp(req.query.teh, 'i');
      if (req.query.vill) filter.vill = new RegExp(req.query.vill, 'i');
      if (req.query.lMark) filter.lMark = new RegExp(req.query.lMark, 'i');
      if (req.query.ward) filter.ward = new RegExp(req.query.ward, 'i');
      if (req.query.booth) filter.booth = new RegExp(req.query.booth, 'i');
      if (req.query.wpn) filter.wpn = new RegExp(req.query.wpn, 'i');
  
      const users = await SecondaryUserModel.find(filter);
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  };


  const SendNotification = async (req, res) => {
    const { phoneNumbers, title, body } = req.body;
  
    if (!phoneNumbers || !title || !body) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }
  
    try {
      // Iterate through each phone number and send a notification to the corresponding topic
      for (const phoneNumber of phoneNumbers) {
        const topic = phoneNumber;
        console.log(topic)
        const message = {
          notification: {
            title,
            body,
          },
          topic,
        };
  
        await admin.messaging().send(message);
      }
  
      console.log('Notifications sent successfully');
      return res.json({ success: true, message: 'Notifications sent successfully' });
    } catch (error) {
      console.error('Error sending notifications:', error);
      return res.status(500).json({ error: error.message });
    }
  };
  
  

module.exports = {
    setUserInfo,getUserById,queryUsers,UpdateUser,UpdateUserPrimary,getUSers,UpdateNameonFrame,getBroadcastMedia,SendNotification
}