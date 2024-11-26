const User = require("../../models/userModel");
const Post = require("../../models/postModel")
const FollowModel = require("../../models/followerModel")

const bcrypt = require("bcrypt");
const { validateStudentRegister , validateStudentLogin, validateChangePassword, validateUpdateUser } = require("../validators/userValidator");
const multer = require("multer")
const CryptoJS = require("crypto-js");
const path = require("path")
const jwt = require('jsonwebtoken');
const { fileUnlink } = require("../../util/helper");
const { registerSucessEmail } = require("../../util/mailer");
const { log } = require("console");


const upload = multer({
    limits:800000,
    storage: multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,"public/uploads/profilePhotos/")
        },
        filename:(req,file,cb)=>{
            cb(null, Date.now() + '__' + file.originalname);
        }
    }),
    fileFilter:(req,file,cb)=>{
        const allowedFileType = ["jpg", "jpeg", "png"];
        if(allowedFileType.includes(file.mimetype.split("/")[1])){
            req.isValidImage = true
            cb(null,true)
        }else{
            req.isValidImage = false
            return cb(null,false)
        }
    }
});

const registerStudent = async (req, res) => {
    try {
        
        if(req.isValidImage === false) {
            return res.status(422).json({error: "Only jpg , jpeg and png file allowed"})
        }
        const {error , value } = validateStudentRegister.validate(req.body);
        if(error){
            fileUnlink(`${req.file.path}`);
            return res.status(400).json({errorMessage:error.details[0].message});
        }
        const userFound = await User.findOne({ email:value.email });
        
        if (userFound) {            
            fileUnlink(`${req.file.path}`);
            return res.status(400).json({ message: "User already registered!" });
        }

        const hashedPassword = await bcrypt.hash(value.password,10);

        const newUser = new User({
            name:req.body.name,
            email:value.email,
            password:hashedPassword,
            profilePhoto:req.file.path
        })
        const userCreated =  await newUser.save();
        await registerSucessEmail(userCreated.name,userCreated.email);
        res.status(201).json(userCreated);
       
    } catch (error) {
        console.log("error file"+error);
        
        res.status(500).json({ message: "An error occurred", error });
    }
};

const loginStudent = async (req,res)=>{
    try {
        const {error , value } = validateStudentLogin.validate(req.body);
        if(error){
            return res.status(400).json({errorMessage:error.details[0].message});
        }
        const userFound = await User.findOne({ email:value.email });
        
        if (!userFound) {
            return res.status(400).json({ message: "Invalid email and password!" });
        }else{
            const isPwdMatch = await bcrypt.compare(value.password,userFound.password)
            if(!isPwdMatch){
                return res.status(400).json({ message: "Invalid email and password!" });
            }else{
                const token = jwt.sign({userId:userFound._id},process.env.JWT_SECRET,{expiresIn:"20m"})
                let cipherToken = CryptoJS.AES.encrypt(token,process.env.CRYPTO_SECRET).toString();
                res.status(201).json({token:cipherToken});
            }
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred", data:error });
    }
}

const changeUserPassword = async(req,res)=>{
    try {
        const userId = req.userId; //from authentication
        const userFound = await User.findById(userId);
        if(!userFound){
            return res.status(400).json({message:"User not found!"});
        }
        const {error ,value} = validateChangePassword.validate(req.body);
        if(error){
            
            return res.status(400).json({errorMessage:error.details[0].message});
        }
        const isMatch = await bcrypt.compare(value.oldPassword,userFound.password);
        if(!isMatch){
            return res.status(400).json({message:"Old password incorrect!"});
        }
        const hashedPassword = await bcrypt.hash(value.newPassword,10);
        userFound.password = hashedPassword;
        await userFound.save();
        res.status(200).json({ message: "Password has been successfully updated!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred", data:error });
    }
}

const deleteUser = async (req,res)=>{
    try {
        const userId = req.userId; //from authentication
        const userFound = await User.findById(userId);
        if(!userFound){
            return res.status(400).json({message:"User not found!"});
        }

        const followers = await FollowModel.find({ followed_to: userId }); 
        const followings = await FollowModel.find({ followed_by: userId });
        
        for (const follower of followers) {
            await User.findByIdAndUpdate(follower.followed_by, {
                $inc: {
                    followers: 0,
                    following: -1,
                }
            }, { new: true });
        }
        
        for (const following of followings) {
            await User.findByIdAndUpdate(following.followed_to, {
                $inc: {
                    followers: -1,
                    following: 0,
                }
            }, { new: true });
        }
        
        const relatedDoc = await FollowModel.deleteMany({$or:[{followed_to:userId},{followed_by:userId}]}); 

        fileUnlink(`${userFound.profilePhoto}`);
        const userPostsFound =  await Post.find({post_by:userId})

        for (let index = 0; index < userPostsFound.length; index++) {
            fileUnlink(`${userPostsFound[index].post}`);
        }
        const deletedUser = await User.findByIdAndDelete(userFound._id);
        const deleteUserPosts = await Post.deleteMany({post_by:userId});
        
        res.status(200).json({message: "User Deleted",deletedUser});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred", data:error });
    }
}

const updateUser = async (req,res)=>{
    try {
        if(req.isValidImage === false) {
            return res.status(422).json({error: "Only jpg , jpeg and png file allowed"})
        }
        const userId = req.userId; //from authentication
        const userFound = await User.findById(userId);
        if(!userFound){
            return res.status(400).json({message:"User not found!"});
        }
        const {error ,value} = validateUpdateUser.validate(req.body);
        if(error){
            return res.status(400).json({errorMessage:error.details[0].message});
        }
        let dataUpdate = value
        if(req.file?.path){
            fileUnlink(`${userFound.profilePhoto}`)
            dataUpdate.profilePhoto = req.file?.path     
        }

        const updatedUser = await User.findByIdAndUpdate(userFound._id,dataUpdate,{new:true});
        res.status(200).json({updatedUser});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred", data:error });
    }
}
module.exports = {registerStudent , loginStudent , upload ,changeUserPassword ,deleteUser , updateUser};