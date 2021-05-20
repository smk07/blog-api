const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt =  require('bcrypt')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    uName:{
        type: String,
        required: true,
        unique: true,
    },
    email:{
        type:String,
        required: true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    fullName:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        default:'member',
    },
    verified:{
        type: Boolean,
        default:false,
    },
    subscribers:{
        type: Array,
        default:[],
    },
    subscribedTo:{
        type: Array,
        default:[],
    }
});

userSchema.pre('save',function(next){
    const user = this;
    
    if(!user.isModified('password')) next();

    bcrypt.genSalt(10,(err,salt)=>{
        if(err) return next(err);

        bcrypt.hash(user.password,salt,(err,hash)=>{
           if(err) return next(err);
           
           user.password = hash;
           next();
        });
    });
});

userSchema.methods.comparePassword = function(password){
    const user = this;
    
    return new Promise((resolve,reject)=>{
        bcrypt.compare(password,user.password,(err,isMatch)=>{
            if(err) return reject(err);

            if(!isMatch) return reject(false);
            return resolve(true);
        });
    });
}

mongoose.model('User',userSchema);