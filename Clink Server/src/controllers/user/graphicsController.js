const GraphicModel=require('../../models/graphicsModel')
const { graphicsPath } = require("../../managers/fileManager");



const CreateGraphics = async (req, res) => {
    try {
      let { title, type } = req.body;
      let { graphicModelList } = req.files;
  
      // Provide default values or handle missing fields gracefully
      title = title || 'Default Title';
      type = type || 'Default Type';
      chipButtonList = chipButtonList || [];
  
      if (req.files.length === 0) {
        return res.status(400).json({ error: 'No files were uploaded.' });
      }
  
      graphicModelList = graphicModelList ? graphicModelList.map((file) => file.filename) : [];
    //   slider = slider ? slider.map((file) => file.filename) : [];
  
      const graphics = {
        title,
        type,
        graphicModelList,
      };
  
      const createGraphics = await GraphicModel.create(graphics);
      return res.status(200).json({ status: 'success', graphicsdata: createGraphics });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };


  const CreateSlider= async (req, res) => {
    try {
        const { slider } = req.files;

        if (!slider) {
            return res.status(400).json({ error: 'Slider files are required.' });
        }

        const createdSlider = slider.map((file) => file.filename);
        return res.status(200).json({ status: 'success', slider: createdSlider });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


const CreatechipButtonList=async (req, res) => {
    try {
        let { chipButtonList } = req.body;

        // Process chipButtonList data here if needed
        chipButtonList = chipButtonList || [];

        return res.status(200).json({ status: 'success', chipButtonList });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

  const UpdateGraphics = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, type, chipButtonList } = req.body;
        let { graphicModelList, slider } = req.files;

        const existingGraphics = await GraphicModel.findById(id);

        if (!existingGraphics) {
            return res.status(404).json({ error: 'Graphics not found' });
        }

        if (title) {
            existingGraphics.title = title;
        }

        if (type) {
            existingGraphics.type = type;
        }

        if (chipButtonList) {
            existingGraphics.chipButtonList = existingGraphics.chipButtonList.concat(chipButtonList);
        }

        if (graphicModelList && Array.isArray(graphicModelList)) {
            existingGraphics.graphicModelList = existingGraphics.graphicModelList.concat(graphicModelList.map(file => file.filename));
        }

        if (slider && Array.isArray(slider)) {
            existingGraphics.slider = existingGraphics.slider.concat(slider.map(file => file.filename));
        }

        const updatedGraphics = await existingGraphics.save();

        return res.status(200).json({ status: 'success', graphicsdata: updatedGraphics });
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

const GetGraphics=async(req,res)=>{
try {
    const findGraphics=await GraphicModel.find()
if(!findGraphics) return res.status(400).send("No Data Found")

return res.status(200).json({status:'success',graphicData:findGraphics})

} catch (error) {
    return res.status(400).send(error.message)
}


}


module.exports={CreateGraphics,getGraphics,GetGraphics,UpdateGraphics,CreateSlider,CreatechipButtonList}