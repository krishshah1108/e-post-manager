const User = require("../../models/userModel");
const FollowModel = require("../../models/followerModel");

const followButton = async (req, res) => {
    try {
        const userId = req.userId; //from authentication
        const userFound = await User.findById(userId);
        if(!userFound){
            return res.status(400).json({message:"User not found!"});
        }
        
        const findToFollow = await User.findById(req.params.fID);
        if(!findToFollow){
            return res.status(400).json({message:"No such user to follow!"});
        }
        
        const ifAlreadyFollowed =  await FollowModel.findOne({followed_to:findToFollow._id,followed_by:userFound._id});
        if(ifAlreadyFollowed){
            await FollowModel.findByIdAndDelete(ifAlreadyFollowed._id);
            findToFollow.followers -= 1 
            userFound.following -= 1 ;
            await findToFollow.save();
            await userFound.save(); 
            
            return res.status(200).json({message:"Successfully unfollowed!"});
        }else{
            const newFollow = new FollowModel({
                followed_to:findToFollow._id,
                followed_by:userFound._id
            })
            findToFollow.followers += 1 
            userFound.following += 1 ;
            
            await findToFollow.save();
            await userFound.save();
            await newFollow.save();

            return res.status(200).json({message:"Successfully followed!"});
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred", error });
    }
}

module.exports = {followButton}