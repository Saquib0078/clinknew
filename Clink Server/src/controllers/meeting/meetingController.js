const MeetModel=require('../../models/meetingModel')
const {meetingPath} = require("../../managers/fileManager");


const meeting = async (req, res) => {
    const { meetName, meetDescription, time, date,radioButtonValue} = req.body;
    const imageID=req.file;
    try {
        if (!meetName || !meetDescription || !time || !date||!imageID) {
            return res.status(400).send("Data should not be empty");
        }

        const MeetDetails = {
            meetName,
            meetDescription,
            time,
            date,
            radioButtonValue,
            imageID:imageID.filename,
            createdBy:req.user._id

        };


        const createMeet = await MeetModel.create(MeetDetails);
        return res.status(200).json({ status: "success", data: createMeet,id:createMeet._id });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

  


// GET /api/liveMeetings
const updateMeet = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, meetdescryption, meettime, image, date } = req.body;

        // Construct the update object dynamically
        const updateFields = {};
        if (title) updateFields.title = title;
        if (meetdescryption) updateFields.meetdescryption = meetdescryption;
        if (meettime) updateFields.meettime = meettime;
        if (image) updateFields.image = image;
        if (date) updateFields.date = date;

        const updatedMeet = await MeetModel.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        );

        if (updatedMeet) {
            return res.json({ status: "success", data: updatedMeet });
        } else {
            return res.status(404).json({ error: 'Meeting not found' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// POST /api/joinMeeting
const deleteMeet=async (req, res) => {
    try {
        const deletedMeet = await MeetModel.findByIdAndRemove(req.params.id);
    
        if (deletedMeet) {
          return res.json({ status: "success", data: deletedMeet });
        } else {
          return res.status(404).json({ error: 'Meeting not found' });
        }
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
  
};


const getMeetImage = (req, res) => {
  let {broadcastMediaID} = req.params;

  if (!broadcastMediaID) {
      return respondFailed(res, "000");
  }
  res.sendFile(meetingPath + broadcastMediaID, (err) => {
      if (err) {
          // console.log(err);
          // throwError(res, {
          //     msg: "file not found"
          // });
      }
  });
}

const getMeet=async(req,res)=>{

    try {
        const meetings = await MeetModel.find();
        return res.json({ status: "success", meeting: meetings });
    } catch (error) {
        return res.status(500).json({ error: error.message });
      }
}

const getMeetById=async(req,res)=>{
    try {
        const meeting = await MeetModel.findById(req.params.id);
    
        if (meeting) {
          return res.json(meeting);
        } else {
          return res.status(404).json({ error: 'Meeting not found' });
        }
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
}

module.exports={meeting,getMeet,getMeetById,updateMeet,deleteMeet,getMeetImage}



