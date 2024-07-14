const {PrimaryUserModel} = require("../../models/userModels");
const {throwError, respondSuccessWithData} = require("../../managers/responseManager");
const NETWORK_LIMIT = 100000;


//TODO
const getNetworks = async (req, res) => {
    let {skip} = req.params;
    let num = req.user.num;

    try {
        let network = await PrimaryUserModel.find({num: {$ne: num}, role: { $ne: 5 }}).sort({_id: 1}).skip(skip).limit(NETWORK_LIMIT);

        let networks = [];
        for (let i = 0; i < network.length; i++) {
            let net = network[i].toObject();
            networks.push({
                username: net["fName"] + " " + net["lName"],
                dp: net["dp"],
                num:net["num"],
                _id:net["_id"]
            });
        }
        respondSuccessWithData(res, networks);

    } catch (e) {
        throwError(res, e);
    }

}


const getNetworksNotification = async (req, res) => {
    let num = req.user.num;

    try {
        let network = await PrimaryUserModel.find();

        // let networks = [];
        // for (let i = 0; i < network.length; i++) {
        //     let net = network[i].toObject();
        //     networks.push({
        //         username: net["fName"] + " " + net["lName"],
        //         dp: net["dp"],
        //         num:net["num"]
        //     });
        // }
        respondSuccessWithData(res, network);

    } catch (e) {
        throwError(res, e);
    }

}




module.exports = {
    getNetworks,getNetworksNotification
}