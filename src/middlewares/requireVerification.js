isVerified = (req,res,next)=>{
    const user = req.user;
    
    if(!user.verified){
       return res.status(400).send({message:"Account Not Verified!"}); 
    }
    console.log("Verified Account");
    next();
};

yetToBeVerified = (req,res,next)=>{
    const user = req.user;
    
    if(user.verified){
       return res.status(400).send({message:"Account Already Verified!"}); 
    }
    console.log("Account not verified!");
    next();
};

module.exports = {isVerified,yetToBeVerified};