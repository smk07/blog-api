const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    postId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Post'
    },
    content:{
        type:String,
        required:true,
    },
    likedBy:{
        type:Array,
        default:[]
    }
});

mongoose.model('Comment',commentSchema);