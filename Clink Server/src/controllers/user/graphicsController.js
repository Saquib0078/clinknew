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
        const { title, type } = req.body;
        let graphicModelList = req.files;

        if (!title || !type || !graphicModelList || graphicModelList.length === 0) {
            return res.status(400).json({ error: 'Invalid request data.' });
        }

        // Extract the filenames and generate IDs
        const graphicModelListWithIds = graphicModelList.map(file => ({ id: new mongoose.Types.ObjectId().toString(), filename: file.filename }));
        
        // Create the graphics object
        const graphics = {
            title,
            type,
            graphicModelList: graphicModelListWithIds
        };

        // Save the graphics object to the database
        const createGraphics = await UniversalModel.create(graphics);

        return res.status(200).json({ status: 'success', graphicsdata: createGraphics });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};



  

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
         console.log(chipButtonList)

        const create =await  ChipButtonListSchema.create(chipButtonList)

        return res.status(200).json({ status: 'success', create });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const UpdateSlider = async (req, res) => {
    try {
        const { sliderId } = req.params;
        const { slider } = req.files;

        if (!slider) {
            return res.status(400).json({ error: 'Slider files are required.' });
        }

        // Logic to update the slider with ID `sliderId` with the new slider file
        const updatedSlider = await SliderModel.findByIdAndUpdate(sliderId, { slider: slider });

        return res.status(200).json({ status: 'success', message: 'Slider updated successfully' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


const DeleteSlider = async (req, res) => {
    try {
        const { sliderId } = req.params;

        // Logic to delete the slider with ID `sliderId`
        await SliderModel.findByIdAndDelete(sliderId);

        return res.status(200).json({ status: 'success', message: 'Slider deleted successfully' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


const UpdateChipButtonList = async (req, res) => {
    try {
        const { chipButtonListId } = req.params;
        const { chipButtonList } = req.body;

        // Logic to update the chipButtonList with ID `chipButtonListId` with the new data
        const updatedChipButtonList = await ChipButtonListSchema.findByIdAndUpdate(chipButtonListId, { chipButtonList });

        return res.status(200).json({ status: 'success', message: 'ChipButtonList updated successfully' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


const DeleteChipButtonList = async (req, res) => {
    try {
        const { chipButtonListId } = req.params;

        // Logic to delete the chipButtonList with ID `chipButtonListId`
        await ChipButtonListSchema.findByIdAndDelete(chipButtonListId);

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
        const { title } = req.query; // Get the title parameter from the query string
        
        // Construct the query based on the title parameter
        const query = title ? { title: title } : {};

        // Aggregation pipeline to sort documents based on whether the title matches the query
        const aggregationPipeline = [
            { $match: query }, // Match documents based on the query
            { $addFields: { match: { $eq: ["$title", title] } } }, // Add a field to indicate whether the title matches the query
            { $sort: { match: -1 } } // Sort documents based on the match field (matching documents first)
        ];

        const findGraphics = await UniversalModel.aggregate(aggregationPipeline);

        if (!findGraphics) return res.status(400).send("No Data Found");

        return res.status(200).json({ status: 'success', graphicData: findGraphics });
    } catch (error) {
        return res.status(400).send(error.message);
    }
}




module.exports={CreateGraphics,getGraphics,GetGraphics,UpdateGraphics,CreateSlider,CreatechipButtonList,
DeleteChipButtonList,UpdateChipButtonList,DeleteSlider,UpdateSlider,DeleteGraphics,GetSlider,GetChipButtonList}