const {UniversalModel, ChipButtonListSchema, SliderSchema}=require('../../models/graphicsModel')

const { graphicsPath } = require("../../managers/fileManager");
const mongoose=require("mongoose")



// const CreateGraphics = async (req, res) => {
//     try {
//       let { title, type } = req.body;
//       let  graphicModelList  = req.files;
    
//       // Provide default values or handle missing fields gracefully
//       title = title || 'Default Title';
//       type = type || 'Default Type';
      
  
//       if (req.files.length === 0) {
//         return res.status(400).json({ error: 'No files were uploaded.' });
//       }
  
//       graphicModelList = graphicModelList ? graphicModelList.map((file) => file.filename) : [];
  
//       const graphics = {
//         title,
//         type,
//         graphicModelList,
//       };
  
//       const createGraphics = await UniversalModel.create(graphics);
//       return res.status(200).json({ status: 'success', graphicsdata: createGraphics });
//     } catch (error) {
//       return res.status(400).json({ error: error.message });
//     }
//   };


const CreateGraphics = async (req, res) => {
    try {
        const { title, type,date } = req.body;
        let graphicModelList = req.files;

        // if (!title || !type || !graphicModelList || graphicModelList.length === 0) {
        //     return res.status(400).json({ error: 'Invalid request data.' });
        // }

        // Extract the filenames and generate IDs
        const graphicModelListWithIds = graphicModelList.map(file => ({ id: new mongoose.Types.ObjectId().toString(), filename: file.filename }));
        
        // Create the graphics object
        const graphics = {
            title,
            type,
            date,
            graphicModelList: graphicModelListWithIds
        };

        // Save the graphics object to the database
        const createGraphics = await UniversalModel.create(graphics);

        return res.status(200).json({ status: 'success', graphicsdata: createGraphics });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};



const DeleteAnyGraphicsImage=async(req,res)=>{
    const { id } = req.params;

    try {
        // Find the document by its ID
        const graphics = await UniversalModel.findById(id);

        if (!graphics) {
            return res.status(404).json({ error: 'Graphics record not found.' });
        }

        // Extract the ID of the object to be deleted from the request body
        const { objectId } = req.body;

        // Filter out the object with the specified ID from the graphicModelList array
        graphics.graphicModelList = graphics.graphicModelList.filter(obj => obj._id.toString() !== objectId);

        // Save the updated document
        await graphics.save();

        return res.status(200).json({ message: 'Object deleted successfully', graphics });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }


}

const UpdateGraphics = async (req, res) => {
    try {
        const { graphicsId } = req.params;
        const { title, type } = req.body;
        const graphicModel = req.file; // Change to accept a single file

        // Find the graphics record based on the graphicsId
        let graphics = await UniversalModel.findById(graphicsId);

        // Handle case where graphics record is not found
        if (!graphics) {
            return res.status(404).json({ error: 'Graphics record not found.' });
        }

        // Update the graphics data
        graphics.title = title || graphics.title;
        graphics.type = type || graphics.type;

        // If a file was uploaded, add it to the graphicModelList array
        if (graphicModel) {
            // If the existing graphicModelList array doesn't exist, initialize it
            if (!graphics.graphicModelList) {
                graphics.graphicModelList = [];
            }

            // Add the new file to the existing files array
            graphics.graphicModelList.push({
                id: new mongoose.Types.ObjectId().toString(),
                filename: graphicModel.filename
            });
        }

        // Save the updated graphics data to the database
        await graphics.save();

        return res.status(200).json({ status: 'success', message: 'Graphics updated successfully', graphics: graphics });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


const GetGraphicsById = async (req, res) => {
    try {
        const id  = req.params.id;
     

        // Find the graphics record based on the graphicsId
        let graphics = await UniversalModel.findById(id);
        // Handle case where graphics record is not found
        if (!graphics) {
            return res.status(404).json({ error: 'Graphics record not found.' });
        }

    

        return res.status(200).json({ status: 'success', message: 'Graphics Found successfully', graphics: graphics });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


const DeleteGraphics = async (req, res) => {
    try {
        const { graphicsId } = req.params;

        // Find the graphics record based on the graphicsId
        const graphics = await UniversalModel.findById(graphicsId);

        // Handle case where graphics record is not found
        if (!graphics) {
            return res.status(404).json({ error: 'Graphics record not found.' });
        }

        // Delete the graphics record from the database
        await UniversalModel.findByIdAndDelete(graphicsId);

        return res.status(200).json({ status: 'success', message: 'Graphics deleted successfully' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const GetChipButtonList = async (req, res) => {
    try {
        // Logic to fetch chip button list data from the database
        const chipButtonList = await ChipButtonListSchema.find();

        return res.status(200).json({ status: 'success', chipBtns: chipButtonList });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


const GetSlider = async (req, res) => {
    try {
        // Logic to fetch slider data from the database
        const sliders = await SliderSchema.find();

        return res.status(200).json({ status: 'success', sliders: sliders });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


  const CreateSlider= async (req, res) => {
    try {
        const slider  = req.file;

        if (!slider) {
            return res.status(400).json({ error: 'Slider files are required.' });
        }

        const createdSlider = await SliderSchema.create({ slider: slider.filename })
        return res.status(200).json({ status: 'success', slider: createdSlider });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


const CreatechipButtonList=async (req, res) => {
    try {
        let chipButtonList  = req.body;
        const existingButton = await ChipButtonListSchema.findOne(chipButtonList );
        if (existingButton) {
            return res.status(400).json({ error: 'Title Already Exists' });
        }

        const create =await  ChipButtonListSchema.create(chipButtonList)

        return res.status(200).json({ status: 'success', create });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const UpdateSlider = async (req, res) => {
    try {
        const  sliderId = req.params;
        const { slider } = req.files;

        if (!slider) {
            return res.status(400).json({ error: 'Slider files are required.' });
        }

        // Logic to update the slider with ID `sliderId` with the new slider file
        const updatedSlider = await SliderModel.findOneAndUpdate({slider:sliderId}, { slider: slider });

        return res.status(200).json({ status: 'success', message: 'Slider updated successfully' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


const DeleteSlider = async (req, res) => {
    try {
        const sliderId = req.params.sliderId
        // Logic to delete the slider with ID `sliderId`
        await SliderSchema.findOneAndDelete({slider:sliderId});

        return res.status(200).json({ status: 'success', message: 'Slider deleted successfully' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


const UpdateChipButtonList = async (req, res) => {
    try {
        let chipButtonListId = req.params.chipButtonListId;
        const newChipButtonList = req.body.chipButtonList; // Assuming the new chip button list is sent in the request body under the key 'chipButtonList'

        // Logic to update the chipButtonList with ID `chipButtonListId` with the new data
        const updatedChipButtonList = await ChipButtonListSchema.findOneAndUpdate(
            { chipButtonList: chipButtonListId }, 
            { chipButtonList: newChipButtonList },
            { new: true } 
        );

        if (!updatedChipButtonList) {
            return res.status(404).json({ status: 'error', message: 'ChipButtonList not found' });
        }

        return res.status(200).json({ status: 'success', message: 'ChipButtonList updated successfully', updatedChipButtonList });
    } catch (error) {
        return res.status(400).json({ status: 'error', error: error.message });
    }
};



const DeleteChipButtonList = async (req, res) => {
    try {
        let chipButtonListId = req.params.chipButtonListId; // Assuming chipButtonListId is the parameter name
        
        // Logic to delete the chipButtonList with the specified chipButtonList identifier
        await ChipButtonListSchema.findOneAndDelete({ chipButtonList: chipButtonListId });

        return res.status(200).json({ status: 'success', message: 'ChipButtonList deleted successfully' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

  
  
const getGraphics = (req, res) => {
    let {graphicsId} = req.params;

    if (!graphicsId) {
        return respondFailed(res, "000");
    }
    res.sendFile(graphicsPath + graphicsId, (err) => {
        if (err) {
            // console.log(err);
            // throwError(res, {
            //     msg: "file not found"
            // });
        }
    });
}

const GetGraphics = async (req, res) => {
    try {

        const filter={}
        // Construct the query based on the title parameter
        if (req.query.title) filter.title = new RegExp(req.query.title, "i");

        // Find documents based on the query
        let findGraphics = await UniversalModel.find(filter);

        if (!findGraphics) return res.status(400).send("No Data Found");
        findGraphics = sortObjectsByFestival(findGraphics);

        return res.status(200).json({ status: 'success', graphics: findGraphics });
    } catch (error) {
        return res.status(400).send(error.message);
    }
}
function sortObjectsByFestival(objects) {
    const today = new Date();
    const todayDay = today.getDate(); // Get the day of the month for today

    // Sort the objects based on the day of the month
    objects.sort((a, b) => {
        const dayA = getDayOfMonth(a.date); // Get the day of the month for object A
        const dayB = getDayOfMonth(b.date); // Get the day of the month for object B

        // Compare the days of the month
        if (dayA === todayDay) {
            return -1; // Object A is for today, so it should come before object B
        } else if (dayB === todayDay) {
            return 1; // Object B is for today, so it should come before object A
        } else {
            return dayA - dayB; // Sort by day of the month in ascending order
        }
    });

    return objects;
}

// Function to extract the day of the month from a date string in DD/MM/YYYY format
function getDayOfMonth(dateString) {
    return Number(dateString.split('/')[0]); // Extract day from DD/MM/YYYY format
}







module.exports={CreateGraphics,getGraphics,GetGraphics,UpdateGraphics,CreateSlider,CreatechipButtonList,
DeleteChipButtonList,UpdateChipButtonList,DeleteSlider,UpdateSlider,DeleteGraphics,GetSlider,GetChipButtonList,
DeleteAnyGraphicsImage,GetGraphicsById}