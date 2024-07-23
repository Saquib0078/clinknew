const MeetModel=require('../../models/meetingModel')
const {meetingPath} = require("../../managers/fileManager");


const meeting = async (req, res) => {
    const { meetName, meetDescription, time, date,radioButtonValue} = req.body;
    const imageID=req.file;
    try {
        if (!meetName || !meetDescription || !time || !date||!imageID) {
            return res.status(400).send("Data should not be empty");
        }

        // Open for All

        // if (radioButtonValue === 'Limited Users' && (!limitedUsers || !Array.isArray(limitedUsers) || limitedUsers.length === 0)) {
        //     return res.status(400).send("For limited meetings, provide an array of phone numbers");
        // }

        console.log(imageID)

        const MeetDetails = {
            meetName,
            meetDescription,
            time,
            date,
            radioButtonValue,
            imageID:imageID.filename,
            createdBy:req.user._id,
            // limitedUsers: radioButtonValue === 'limited' ? limitedUsers : []

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
        const { meetName, meetDescription, time, date,radioButtonValue } = req.body;
        let image;

        if (req.file) {
            image = req.file.filename; // or req.file.path, depending on how you store files
        }

        // Fetch the existing meeting
        const existingMeet = await MeetModel.findById(id);
        if (!existingMeet) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        // Update fields with new values or retain existing ones
        const updateFields = {
            meetName: meetName || existingMeet.meetName,
            meetDescription: meetDescription || existingMeet.meetDescription,
            time: time || existingMeet.time,
            date: date || existingMeet.date,
            imageID: image || existingMeet.imageID,
            radioButtonValue:radioButtonValue ||existingMeet.radioButtonValue
        };

        // console.log(updateFields)
        const updatedMeet = await MeetModel.findByIdAndUpdate(id, updateFields, { new: true });

        return res.json({ status: "success", data: updatedMeet });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


const UpdateLiveStatus=async (req, res) => {
    const  id  = req.params.id;
    const  {live}  = req.body;

    try {
        // Validate the request
    

        // Find the meet by ID and update its live status
        const meet = await MeetModel.findByIdAndUpdate(
            id,
            { live: live },
            { new: true, runValidators: true }
        );

        if (!meet) {
            return res.status(404).json({ message: 'Meet not found' });
        }

        res.json({ message: 'Live status updated successfully', meet });
    } catch (error) {
        res.status(500).json({ message:error.message });
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
        const meetings = await MeetModel.find().sort({ createdAt: -1 });
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

module.exports={meeting,getMeet,getMeetById,updateMeet,deleteMeet,getMeetImage,UpdateLiveStatus}



