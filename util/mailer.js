const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host:process.env.EMAIL_HOST,
    port:process.env.EMAIL_PORT,
    secure: false,
    auth:{
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,
    }
});

const registerSucessEmail = async (name,userEmail)=>{
    try {
        await transporter.sendMail({
            from:`${process.env.EMAIL_USER}`,
            to:userEmail,
            subject:"Registration successfull with Post Mangaer",
            text:`Welcome ${name},You have successfully registerd with us! We are glad to have you! `
        });
        console.log("email sent!");
    } catch (error) {
        console.log(error);
    }
}

module.exports = {registerSucessEmail}