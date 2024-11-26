const mongoose = require("mongoose");

const followerSchema =  new mongoose.Schema({
    
    followed_to:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    followed_by:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    
},{
    timestamps:true
});

module.exports = mongoose.model("Follower",followerSchema);
