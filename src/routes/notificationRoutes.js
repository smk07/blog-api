const express = require('express')
const mongoose = require('mongoose')
const requireAuth = require('../middlewares/requireAuth')
const { isVerified } = require('../middlewares/requireVerification')
const notificationRoutes = express.Router()
const Notification = mongoose.model('Notification')

notificationRoutes.use(requireAuth,isVerified);

notificationRoutes.get('/',async(req,res)=>{
    try{
        const notifications = await Notification.find({uname:req.user.uName});
        return res.status(200).send({message:"Notifications retrieved successfully!",data:notifications});
    }
    catch(err){
        console.log(err.message);
        return res.status(400).send({message:"Error in retrieving notifications!"});
    }
});

notificationRoutes.post('/',async(req,res)=>{
    const {uname,postId,content} = req.body;
    
    return postingNotifications(userId,postId,content);
});

async function postingNotifications(unames,byUname,postId,content){
    try{
        for(let uname of unames){
            const notification = new Notification({uname,byUname,postId,content});
            await notification.save();
        }
        // return res.status(201).send({message:"Notifcation Created"});
    }
    catch(err){
        console.log(err.message);
        // return res.status(400).send({message:"Error in creating notifications"});
    }
}

notificationRoutes.put('/:id',async(req,res)=>{
    const {id} = req.params;

    try{
        const notification = await Notification.findById({_id:id});
        notification.read = true;
        await notification.save();
        return res.status(202).send({message:"Notification has been read"});
    }
    catch(err){
        console.log(err.message)
        return res.status(400).send({message:"Error in updating Notification!"});
    }
});

notificationRoutes.delete('/:id',async(req,res)=>{
    const {id} = req.params;

    try{
        const notification = await Notification.findByIdAndDelete({_id:id});
        return res.status(204).send({message:"Notification deleted!",notification});
    }
    catch(err){
        console.log(err.message)
        return res.status(400).send({message:"Error in deleting Notification!"});
    }
});

module.exports = {notificationRoutes,postingNotifications};