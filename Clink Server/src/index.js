require('dotenv').config();

const express = require('express')
const compression = require('compression');
const app = express()
const socketIO = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const bodyParser = require('body-parser');

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
const appRoute = require('./routes/appRoutes')
const userRoute = require('./routes/userRoutes')
const adminRoute = require('./routes/adminRoutes')
const mediaRoute = require('./routes/mediaRoutes')
const meetingRoute=require('./routes/meetingRoutes')
const TaskRoute=require('./routes/taskRoutes')
const GraphicsRouts=require('./routes/graphicsRoutes')


const databaseManager = require("./managers/databaseManager");
const MeetModel=require('./models/meetingModel')
const jwtMiddleware=require('./middleware/jwtAuthMiddleware')



app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(compression({
    level: 6, threshold: 0
}));

app.use('/app', appRoute);
app.use('/user', userRoute);
app.use('/admin', adminRoute);
app.use('/media', mediaRoute);
app.use('/meeting', meetingRoute);
app.use('/task', TaskRoute);
app.use('/graphics', GraphicsRouts);




app.use(function (req, res) {
    return res.status(404).send({status: false, message: "Path Not Found"})
});






const port = process.env.PORT || 3000;
app.listen(port, function () {
    databaseManager.connect();
    console.log("Server running on Port " + port);
});

