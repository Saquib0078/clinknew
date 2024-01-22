const GraphicModel=require('../../models/graphicsModel')


const CreateGraphics=async(req,res)=>{

try {
    const {title,type,chipButtonList}=req.body;
const graphicModelList=req.files

if ( req.files.length === 0) {
    return res.status(400).json({ error: 'No files were uploaded.' });
  }

     const imageUrls = graphicModelList.map(file => file.filename);

     const graphics={
        title,
        type,
        chipButtonList,
        graphicModelList:imageUrls
     }

     const createGraphics=await GraphicModel.create(graphics)
     return res.status(200).json({ status:'success',data:createGraphics});

} catch (error) {
    return res.status(400).json({ error: error.message });

}

}


module.exports={CreateGraphics}