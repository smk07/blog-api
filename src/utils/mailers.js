const nodemailer = require('nodemailer')

let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user:'housefull.abacus@gmail.com',
        pass:'housefull.abacus@2021'
    }
});

module.exports = (email,content)=>{
    mailTransporter.sendMail({
        from: 'housefull.abacus@gmail.com',
        to: email,
        subject:'Verification',
        html: `${content}`
    }, function(err,data){
        if(err){
            console.log(err.message);
            console.log('Error Occurs');
        }
        else{
            console.log("Email sent successfully!")
        }
    })
}
