const express = require('express')
const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    postId:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    content:{
        type:String,
        required:true,
    },
    read:{
        type:Boolean,
        default:false,
    }
});

mongoose.model('Notification',notificationSchema);