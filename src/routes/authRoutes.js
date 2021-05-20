const express = require('express')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const Post = mongoose.model('Post')
const Comment = mongoose.model('Comment')
const router = express.Router()
const jwt = require('jsonwebtoken')
const SECRET_KEY = "ITHUDAN VIDAI PERUVADHU UNGAL NAAN"
const mailer = require('../../src/utils/mailers')
const requireAuth = require('../middlewares/requireAuth')
const { yetToBeVerified } = require('../middlewares/requireVerification')
const VERIFICATION_SECRET_KEY = "VANAKAM DA MAPLA CHENNAI LA IRUNDHU"

router.post('/signup',async(req,res)=>{
    const {uname,email,password,fname,lname} = req.body;
    // console.log(body);
    try{
        const user = new User({uName:uname,email,password,fullName:fname+" "+lname,verified:false});
        await user.save();
        const token = jwt.sign({userId:user._id},SECRET_KEY);
        const verificationToken = jwt.sign({userId:user._id},VERIFICATION_SECRET_KEY,{expiresIn:"300s"});
        // console.log(token+"\n"+verificationToken);
        // mailer(email,verificationToken,"Verify Yourself!","verify");
        mailer(email,`<h1>Click the link below to verify your Email </h1> 
                <a href="http://127.0.0.1:3000/verify/?token=${verificationToken}"> Click here to Verify yourself</a>`);
        return res.status(201).send({message:"Account Created Successfully",token});
    }
    catch(err){
        console.log(err);
        return res.status(400).send({message:"Username already exists!"});
    }
});
router.post('/admin/signup',async(req,res)=>{
    const {uname,email,password,fname,lname} = req.body;
    // console.log(body);
    try{
        const user = new User({uName:uname,email,password,fullName:fname+" "+lname,verified:false,role:'admin'});
        await user.save();
        const token = jwt.sign({userId:user._id},SECRET_KEY);
        const verificationToken = jwt.sign({userId:user._id},VERIFICATION_SECRET_KEY,{expiresIn:"300s"});
        // console.log(token+"\n"+verificationToken);
        // mailer(email,verificationToken,"Verify Yourself!","verify");
        mailer(email,`<h1>Click the link below to verify your Email </h1> 
                <a href="http://127.0.0.1:3000/verify/?token=${verificationToken}"> Click here to Verify yourself</a>`);
        return res.status(201).send({message:"Account Created Successfully",token});
    }
    catch(err){
        console.log(err);
        return res.status(400).send({message:"Username already exists!"});
    }
});

router.get('/verify',async(req,res)=>{
    const {token} = req.query;
    // console.log(`Token:${token}`);
    let id ;
    return jwt.verify(token,VERIFICATION_SECRET_KEY,async (err,payload)=>{
        if(err){
            return res.status(403).send({message:"Link Expired"});
        }
        id = payload.userId; 
        try{
            const user = await User.findById(id);
            // console.log(user);
            if(user.verified) throw new Error("Account Already Verified!");
            await User.findOneAndUpdate({_id:id},{$set:{"verified":true}},{useFindAndModify:false});
            return res.status(200).send({message:"Verified"});
        }
        catch(e){
            console.log(e.message);
            return res.status(400).send({message:"Problem exists in verifying!"});
        }   
    });
});

router.post('/verify/new',requireAuth,yetToBeVerified,async(req,res)=>{
    const user = req.user;
    const token = jwt.sign({userId:user._id},VERIFICATION_SECRET_KEY,{expiresIn:"300s"});
    mailer(user.email,`<h1>Click the link below to verify your Email </h1> 
            <a href="http://127.0.0.1:3000/verify/?token=${token}"> Click here to Verify yourself</a>`);
    return res.status(200).send({message:"New Verification Link has been sent to your mail!"});
});

router.post('/reset',(req,res)=>{
    const {password} = req.body;
    const {token} = req.query;

    return jwt.verify(token,SECRET_KEY,async(err,payload)=>{
        if(err)
            return res.status(403).send({message:"Link Expired"});

        id = payload.userId;
        try{
            const user = await User.findById({_id:id});
            user.password = password;
            await user.save();
            return res.status(200).send({message:"Password Reset Successful"});
        }
        catch(e){
            console.log(e.message);
            return res.status(400).send({message:"Password Reset Failed"});
        }
    });
});

router.post('/forgot',async (req,res)=>{
    const {loginId} = req.body;
    let user;
    try{
        if(loginId.includes("@")){
            user = await User.findOne({email:loginId});
        }
        else{
            user = await User.findOne({uName:loginId});
        }
        const token = jwt.sign({userId:user._id},SECRET_KEY,{expiresIn:"300s"});
        mailer(user.email,`<h1>Click the link below to reset your password </h1> 
                <a href="http://127.0.0.1:3000/reset/?token=${token}"> Click here to reset your password</a>`);
        // console.log("Reset Password Mail Sent Successfully");
        return res.status(200).send({message:"Reset Password Link has been sent to your mail!"});
    }catch(err){
        return res.status(400).send({message:"Invalid username or password!"});
    }
});

router.post('/signin',async(req,res)=>{
    const {loginId,password} = req.body;
    console.log(req.body);

    let user;
    try{
        if(loginId.includes("@")){
        user = await User.findOne({email:loginId});
        console.log(user);
        }
        else{
            user = await User.findOne({uName:loginId});
            console.log(user);
        }
        await user.comparePassword(password);
        const token = jwt.sign({userId:user._id},SECRET_KEY);
        return res.status(200).send({message:"Successfully Signed in",token});
    }
    catch(err){
        return res.status(401).send({message:"Invalid Credentials"});
    }
    // console.log(user);
});

router.post('/:uname/subscribe',requireAuth,async(req,res)=>{
    const {uname} = req.params;
    console.log(uname)

    try{
        const user = await User.findOne({uName:uname});
        const reqUser = await User.findById({_id:req.user._id});
        // console.log(user);
        user.subscribers.push(req.user._id);
        reqUser.subscribedTo.push(user._id);
        await user.save();
        await reqUser.save();
        req.user = reqUser;
        return res.status(200).send({message:"Subscribed!"});
    }
    catch(err){
        console.log(err.message);
        return res.status(400).send({message:"Error in subscribing"});
    }
});

router.post('/:uname/unsubscribe',requireAuth,async(req,res)=>{
    const {uname} = req.params;

    try{
        const user = await User.findOne({uName:uname});
        const reqUser = await User.findById({_id:req.user._id});
        // console.log(user);
        user.subscribers.pop(req.user._id);
        reqUser.subscribedTo.pop(user._id);
        await user.save();
        await reqUser.save();
        req.user = reqUser;
        return res.status(200).send({message:"Unsubscribed!"});
    }
    catch(err){
        console.log(err.message);
        return res.status(400).send({message:"Error in unsubscribing"});
    }
});

router.get('/:uname',async(req,res)=>{
    const {uname} = req.params;

    try{
        const user = await User.findOne({uName:uname});
        const posts = await Post.find({userId:user.id});
        data = []
        for(let post of posts){
            const comments = await Comment.find({postId:post.id});
            data.push({...post._doc,comments});
        }
        return res.status(200).send({message:"Successfully retrieved the profile!",data});
    }
    catch(err){
        console.log(err.message)
        return res.status(400).send({message:"Error in fetching profile details"});
    }
});

module.exports = router;
