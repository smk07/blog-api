const express = require('express')
const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    uname:{
        type: String,
        required:true
    },
    postId:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    byUname:{
        type: String,
        default: null,
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