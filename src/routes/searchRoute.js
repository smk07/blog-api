const express = require('express')
const router = express.Router()
const mongoose  = require('mongoose')
const User = mongoose.model('User')

// router.get('/:uname',(req,res)=>{
//     console.log("HAHAHAHA");
// })
router.get('/',async(req,res)=>{
    // console.log("Inside")
    const searchText = req.query.text;
    // console.log(searchText);
    try{
        // const users = await User.find({'uName':{$regex:/searchText/}});
        const users = await User.find({'uName':new RegExp(searchText, "i")});
        unames = []
        for(let user of users){
            unames.push(user.uName);
        }
        return res.status(200).send({message:"Success",data:unames});
    }
    catch(err){
        console.log(err.message);
        return res.status(400).send({message:"Error in searching!"});
    }
});

module.exports = router;