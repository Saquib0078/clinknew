const fs = require("fs");
const path = require("path");

const rawDataPath = "../../data/";

const dataPath = path.join(__dirname, rawDataPath);
const usersPath = path.join(__dirname, rawDataPath + "/users/");
const broadcastsPath = path.join(__dirname, rawDataPath + "/broadcasts/");
const meetingPath = path.join(__dirname, rawDataPath + "/meeting/");
const taskPath = path.join(__dirname, rawDataPath + "/task/");
const graphicsPath = path.join(__dirname, rawDataPath + "/graphics/");




const deleteBroadcastImage = (broadcastID, type, callback) => {
    fs.unlink(broadcastsPath + broadcastID + "." + type, (err) => {
        callback();

        
    });
}

module.exports = {
    dataPath, usersPath, broadcastsPath, deleteBroadcastImage,meetingPath,taskPath,graphicsPath
}