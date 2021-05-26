const express = require('express')
const mongoose = require('mongoose')
const Comment = mongoose.model('Comment');
const Notification = mongoose.model('Notification');

const postSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    uname:{
        type: String,
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    likedBy:{
        type:Array,
        default:[]
    }
});

postSchema.pre('deleteOne', { document: true },async function(next){
    console.log("Inside Delete one");
    await Comment.deleteMany({postId:this._id});
    console.log("Deleted Comments");

    await Notification.deleteMany({postId:this._id});
    next();
});

mongoose.model('Post',postSchema);