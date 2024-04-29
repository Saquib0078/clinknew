require('dotenv').config();

const express = require('express')
const compression = require('compression');
const app = express()
const socketIO = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const bodyParser = require('body-parser');
const cron = require('node-cron');
const moment = require('moment');
const cluster = require('node:cluster');
const numCPUs = require('node:os').availableParallelism();
const process = require('node:process');

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
const appRoute = require('./routes/appRoutes')
const userRoute = require('./routes/userRoutes')
const adminRoute = require('./routes/adminRoutes')
const mediaRoute = require('./routes/mediaRoutes')
const meetingRoute=require('./routes/meetingRoutes')
const TaskRoute=require('./routes/taskRoutes')
const GraphicsRouts=require('./routes/graphicsRoutes')
const StickerRoute=require('./routes/stickerRoutes')

const admin = require("firebase-admin");


const databaseManager = require("./managers/databaseManager");
const MeetModel=require('./models/meetingModel')
const jwtMiddleware=require('./middleware/jwtAuthMiddleware');
const { PrimaryUserModel, SecondaryUserModel } = require('./models/userModels');

cron.schedule('0 0 * * *', async () => {
    try {
        const today = moment();
        console.log(today);

        // Find users with today's date of birth in SecondaryUserModel
        const usersWithBirthday = await SecondaryUserModel.find({
            dob: {
                $regex: `^${today.format('DD/MM|D/M')}`            }
        });

        console.log(usersWithBirthday.length)
        if (usersWithBirthday.length === 0) {
            console.log("No users found with birthdays today");
            return;
        }

        // Iterate over each user with birthday
        let primaryUser;
        for (const user of usersWithBirthday) {
            // Find the corresponding user in PrimaryUserModel
             primaryUser = await PrimaryUserModel.findOne({ num: user.num });
              console.log(primaryUser.fName)
            // Check if the user has a device token
            if (!primaryUser || !primaryUser.num) {
                console.error(`User ${user._id} does not have a device token or not found in PrimaryUserModel. Skipping notification.`);
                continue;
            }

            // Construct the birthday notification message
            const message = {
                notification: {
                    title: "Happy Birthday!",
                    body: `Happy birthday, ${primaryUser.fName}! Wishing you a fantastic day filled with joy and happiness! From C-Link Family`,
                    imageUrl: "https://cdn.pixabay.com/photo/2023/08/21/17/44/flower-8204791_1280.jpg",
                },
                topic: primaryUser.num, // Use the device token of the user
            };

            // Send the birthday notification
            await admin.messaging().send(message);
            console.log(`Birthday notification sent successfully to user ${user.num}`);
        }

        console.log("Birthday notifications sent successfully to all users with birthdays today");
    } catch (error) {
        console.error("Error sending birthday notifications:", error);
    }
});


app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(compression({
    level: 6, threshold: 0
}));
//mongodb://127.0.0.1:27017/clink
//mongodb+srv://saquib007:IUnXazhITeBF13a0@cluster0.eo7jwgy.mongodb.net/clink
app.use('/app', appRoute);
app.use('/user', userRoute);
app.use('/admin', adminRoute);
app.use('/media', mediaRoute);
app.use('/meeting', meetingRoute);
app.use('/task', TaskRoute);
app.use('/graphics', GraphicsRouts);
app.use('/sticker', StickerRoute);



app.get('/test-me', function (req, res) {
    res.json('My First ever api!')
});




app.use(function (req, res) {
    return res.status(404).send({status: false, message: "Path Not Found"})
});

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
  
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  
    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  } else {
    
    const port = process.env.PORT || 3000;
    app.listen(port, function () {
        databaseManager.connect();
        console.log("Server running on Port " + port);
    });
    
    console.log(`Worker ${process.pid} started`);
  }






