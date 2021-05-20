const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const SECRET_KEY = "ITHUDAN VIDAI PERUVADHU UNGAL NAAN"
const User = mongoose.model('User')

module.exports = (req,res,next)=>{
    const {authorization} = req.headers;

    if(!authorization)
        return res.status(403).send({error:"You must be logged in!1"});

    const token = authorization.replace('Bearer ','');
    jwt.verify(token,SECRET_KEY,async(err,payload)=>{
        if(err) 
            return res.status(403).send({error:"You must be logged in!2"});

        const {userId} = payload;
        try{
            const user = await User.findById({_id:userId}).exec();
            req.user = user;
        }
        catch(err){
            console.log(err.message);
            return res.status(403).send({error:"You must be logged in!3"});
        }
        next();
    });
};