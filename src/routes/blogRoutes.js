const express = require('express')
const mongoose = require('mongoose')
const requireAuth = require('../middlewares/requireAuth')
const { isVerified } = require('../middlewares/requireVerification')
const User = mongoose.model('User')
const Comment = mongoose.model('Comment')
const Post = mongoose.model('Post')
const router = express.Router()
const {postingNotifications} = require('./notificationRoutes')

router.use(requireAuth,isVerified);
router.post('/',async (req,res)=>{
    // console.log(req.body);
    // console.log(req.user);
    const {title,description} = req.body;
    try{
        const post = new Post({userId:req.user._id,title,description});
        await post.save();
        const comments = await Comment.find({postId:post._id});
        postingNotifications(req.user.subscribers,post._id,"newPost");
        return res.status(201).send({message:"Post Created",data:{post,comments}});
    }
    catch(err){
        console.log(err.message)
        return res.status(400).send({message:"Error in creating posts"});
    }
});

router.get('/',async(req,res)=>{
    try{
        if(String(req.user.role)=='admin'){
            const posts = await Post.find({});
            // console.log(posts)
            data = []
            for(let post of posts){
                // console.log(post);
                const id = post.id
                const comments = await Comment.find({postId:id});
                data.push({post,comments});
            }
            return res.status(200).send({message:"Post Retrieved",data});
        }
        const posts = await Post.find({userId:req.user._id});
        // console.log(posts)
        data = []
        for(let post of posts){
            // console.log(post);
            const id = post.id
            const comments = await Comment.find({postId:id});
            data.push({post,comments});
        }
        return res.status(200).send({message:"Post Retrieved",data});
    }
    catch(err){
        console.log(err.message)
        return res.status(400).send({message:"Error in retrieving posts"});
    }
});

router.get('/:id',async(req,res)=>{
    try{
        const {id} = req.params;
        const post = await Post.findById({_id:id});
        // console.log(post)
        // if(post==null) throw new Error("Post Not Found");
        const comments = await Comment.find({postId:id});
        return res.status(200).send({message:"Post Retrieved",data:{post,comments}});
    }
    catch(err){
        console.log(err.message)
        return res.status(400).send({message:"Error in retrieving post"});
    }
});

router.put('/:id',async(req,res)=>{
    try{
        const {id} = req.params;
        const {title,description} = req.body;
        const post = await Post.findByIdAndUpdate({_id:id},{$set:{title,description}},{useFindAndModify:false});
        const comments = await Comment.find({postId:id});
        return res.status(202).send({message:"Post has been updated",data:{post,comments}});
    }
    catch(err){
        console.log(err.message);
        return res.status(400).send({message:"Error in updating post"});
    }
});

router.delete('/:id',async(req,res)=>{
    try{
        const {id} = req.params;
        const comments = await Comment.find({postId:id});
        const post = await Post.findOne({_id:id});
        const post1 = await post.deleteOne();
        return res.status(200).send({message:"Post has been deleted",data:{post1,comments}});
    }
    catch(err){
        console.log(err.messsage);
        return res.status(400).send({messsage:"Error in deleting post!"});
    }
});

router.post('/:id/comment',async(req,res)=>{
    const {id} = req.params;

    const {content} = req.body;

    try{
        const comment = new Comment({userId:req.user._id,postId:id,content});
        await comment.save();
        const comments = await Comment.find({postId:id});
        const post = await Post.findById({_id:id});
        userId = []
        if(String(post.userId)!=String(req.user._id))
            userId.push(post.userId);

        for(let c of comments){
            if(!userId.includes(c.userId) && String(c.userId)!=String(req.user._id)){
                userId.push(c.userId);
            }
        }
        postingNotifications(userId,id,"comment");
        return res.status(200).send({message:"Commented on this post!",data:comment});
    }
    catch(err){
        console.log(err.message)
        return res.status(400).send({message:"Error in commenting!"});
    }
});

router.get('/:id/comment',async(req,res)=>{
    const {id} = req.params;
    
    try{
        const comments = await Comment.find({postId:id});
        return res.status(200).send({message:"Retrieved all the comments on this post!",data:comments});
    }
    catch(err){
        console.log(err.message);
        return res.status(400).send({message:"Error in retrieving the comments!"});
    }
});

router.put('/:id/comment/:cid',async(req,res)=>{
    const {cid} = req.params;
    const {content} = req.body;
    
    try{
        const comment = await Comment.findById({_id:cid});
        // console.log(comment.userId+"\n"+req.user._id)
        if(String(comment.userId)!=String(req.user._id)){
            // console.log(typeof(String(comment.userId))+"\t"+typeof(String(req.user._id)))
            throw new Error("You can't access this comment")
        }
        comment.content = content
        await comment.save();
        return res.status(202).send({message:"Updated the comment!",data:comment});
    }
    catch(err){
        console.log(err.message)
        return res.status(400).send({message:"Error in updating the comment!"}); 
    }
});

router.delete('/:id/comment/:cid',async(req,res)=>{
    const {id,cid} = req.params;
    
    try{
        const post = await Post.findById({_id:id});
        const comment = await Comment.findById({_id:cid});
        // console.log(post.userId+"\n"+comment.userId)
        if(String(comment.userId)!=String(req.user._id) && String(post.userId)!=String(req.user._id) 
                    && String(req.user.role)!='admin'){
            console.log(typeof(String(comment.userId))+"\n"+typeof(String(req.user._id))+"\n"+typeof(String(post.userId))+"\n");
            throw new Error("You can't access this comment")
        }
        const data = await comment.delete();
        return res.status(204).send({message:"Updated the comment!",data});
    }
    catch(err){
        console.log(err.message)
        return res.status(400).send({message:"Error in deleting the comment!"}); 
    }
});

router.post('/:id/like',async(req,res)=>{
    const {id} = req.params;
    
    try{
        const post = await Post.findById({_id:id});
        const comments = await Comment.find({postId:id});
        // console.log(typeof(req.user.uName));
        // console.log(String(req.user.uName));
        if(!post.likedBy.includes(req.user.uName)){
            post.likedBy.push(req.user.uName);
            // console.log("Liking")
            await post.save();
        }
        if(String(post.userId)!=String(req.user._id))
            postingNotifications([post.userId],id,"Like");
        return res.status(200).send({message:"Liked the post",data:{post,comments}});
    }
    catch(err){
        console.log(err.message)
        return res.status(400).send({message:"An error has occured!"});
    }
});

router.post('/:id/unlike',async(req,res)=>{
    const {id} = req.params;
    try{
        const post = await Post.findById({_id:id});
        const comments = await Comment.find({postId:id});
        // console.log(typeof(req.user.uName));
        // console.log(String(req.user.uName));
        if(post.likedBy.includes(req.user.uName)){
            post.likedBy.pop(req.user.uName);
            // console.log("Liking")
            await post.save();
        }
        return res.status(200).send({message:"Unliked the post",data:{post,comments}});
    }
    catch(err){
        console.log(err.message)
        return res.status(400).send({message:"An error has occured!"});
    }
});

router.post('/:id/comment/:cid/like',async(req,res)=>{
    const {id,cid} = req.params;

    try{
        const post = await Post.findById({_id:id});
        const comment = await Comment.findById({_id:cid});
        // console.log(comment.likedBy)
        if(!comment.likedBy.includes(req.user.uName)){
            comment.likedBy.push(req.user.uName);
            // console.log("Liking")
            await comment.save();
        }
        const comments = await Comment.find({postId:id});
        return res.status(200).send({message:"Liked the comment",data:{post,comments}});
    }
    catch(err){
        console.log(err.message)
        return res.status(400).send({message:"An error has occured!"});
    }
});

router.post('/:id/comment/:cid/unlike',async(req,res)=>{
    const {id,cid} = req.params;

    try{
        const post = await Post.findById({_id:id});
        const comment = await Comment.findById({_id:cid});
        if(comment.likedBy.includes(req.user.uName)){
            comment.likedBy.pop(req.user.uName);
            // console.log("Liking")
            await comment.save();
        }
        const comments = await Comment.find({postId:id});
        return res.status(200).send({message:"Unliked the comment",data:{post,comments}});
    }
    catch(err){
        console.log(err.message)
        return res.status(400).send({message:"An error has occured!"});
    }
});

module.exports = router;