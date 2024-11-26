const Post = require("../../models/postModel");
const User = require("../../models/userModel");
const likeModel = require("../../models/likeModel");
const { fileUnlink } = require("../../util/helper");
const { validateAddPost, validateUpdatePost} = require("../validators/postValidator");
const multer = require("multer");
const { validateUpdateUser } = require("../validators/userValidator");

const uploadPost = multer({
    limits:800000,
    storage: multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,"public/uploads/postImages/")
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

const addPost = async (req, res) => {
    try {
        if(req.isValidImage === false) {
            return res.status(422).json({error: "Only jpg , jpeg and png file allowed"})
        }

        const userId = req.userId; //from authentication
        const userFound = await User.findById(userId);
        if(!userFound){
            return res.status(400).json({message:"User not found!"});
        }

        const {error , value } = validateAddPost.validate(req.body);
        if(error){
            fileUnlink(`${req.file?.path}`);
            return res.status(400).json({errorMessage:error.details[0].message});
        }
               
        const newPost = new Post({
            caption:value.caption,
            post_by:userFound._id,
            post:req.file?req.file.path:"No-image"
        })
        
        const postCreated =  await newPost.save();
        res.status(201).json(postCreated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred", error });
    }
};

const deletePost = async (req, res)=>{
    try {
        const userId = req.userId; //from authentication
        const userFound = await User.findById(userId);
        if(!userFound){
            return res.status(400).json({message:"User not found!"});
        }

        const postToDelete = await Post.findById(req.params.postID);
        if(postToDelete.post_by.toString() !== userId){
            return res.status(403).json({message:"Unauthorized User"});
        }
        fileUnlink(`${postToDelete.post}`)
        const deletedPost = await Post.findByIdAndDelete(postToDelete._id);
        res.status(200).json(deletedPost);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred", error });
    }
}
const updatePost = async (req,res)=>{
    try {
        
        const userId = req.userId; //from authentication
        const userFound = await User.findById(userId);
        
        if(!userFound){
            return res.status(400).json({message:"User not found!"});
        }
        const {error ,value} = validateUpdatePost.validate(req.body);
        if(error){
            return res.status(400).json({errorMessage:error.details[0].message});
        }
        const postToUpdate = await Post.findById(req.params.postID);
        if(!postToUpdate){
            return res.status(403).json({message:"No post found of such user"});
        }
        if(postToUpdate.post_by.toString() !== userId){
            return res.status(403).json({message:"Unauthorized User"});
        }
        const updatedUser = await Post.findByIdAndUpdate(postToUpdate._id,value,{new:true});
        res.status(200).json({updatedUser});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred", data:error });
    }
}
const viewFeed = async (req,res)=>{
    try {
        const userId = req.userId;
        const userFound = await User.findById(userId);
        
        if(!userFound){
            return res.status(400).json({message:"User not found!"});
        }
        const postsFound =  await Post.find({post_by:{$ne:userId}}); 
        res.status(200).json({postsFound});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred", data:error });
    }
}
const likeButton = async (req, res) => {
    try {
        const userId = req.userId; //from authentication
        const userFound = await User.findById(userId);
        if(!userFound){
            return res.status(400).json({message:"User not found!"});
        }
        const postToLike = await Post.findById(req.params.postID);
        if(!postToLike){
            return res.status(403).json({message:"No post found!"});
        }
        const ifAlreadyLike = await Post.findOne({like_post:postToLike._id,like_by:userFound._id});
        if(ifAlreadyLike){
            await likeModel.findByIdAndDelete(ifAlreadyLike._id);
            postToLike.likes -= 1 
            await postToLike.save();
            return res.status(200).json({message:"Like undone"});
        }else{
            const newLike = new likeModel({
                like_post:postToLike._id,
                like_by:userFound._id
            })
            await newLike.save();
            postToLike.likes += 1;
            await postToLike.save();
            return res.status(200).json({message:"Like Done"});
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred", error });
    }
}

module.exports = {uploadPost ,addPost , deletePost , updatePost , viewFeed ,likeButton}