require('./src/models/User')
require('./src/models/Comment')
require('./src/models/Notification')
require('./src/models/Post')
const express = require('express');
const mongoose = require('mongoose')
const app = express();
const PORT = 3000
const authRoutes = require('./src/routes/authRoutes')
const blogRoutes = require('./src/routes/blogRoutes');
const searchRoute = require('./src/routes/searchRoute');
const {notificationRoutes} = require('./src/routes/notificationRoutes');
const cors = require('cors')

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authentication");
    next();
});
app.options('*', cors())
app.use(express.json());
app.use('/search',searchRoute);
app.use('/posts',blogRoutes);
app.use('/notifications',notificationRoutes);
app.use('/',authRoutes);

app.get('/',(req,res)=>{
    return res.status(200).send("Vanakam da mapla! Localhost la irundhu!");
})

const mongoURI = "";

mongoose.connect(mongoURI,{
    useCreateIndex:true,
    useUnifiedTopology:true,
    useNewUrlParser:true,
});

mongoose.connection.on('connected',()=>{
    console.log("Connecting to mongo db");
})

mongoose.connection.on('error',()=>{
    console.log("Error in connecting to database");
})

app.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}`);
});
