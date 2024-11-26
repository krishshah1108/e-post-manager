const mongoose = require("mongoose");

const likeSchema =  new mongoose.Schema({
    
    like_post:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Post",
    },
    like_by:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

},{
    timestamps:true
});

module.exports = mongoose.model("Like",likeSchema);
