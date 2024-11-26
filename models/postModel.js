const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    caption:{
        type: String,
        required:[true,"Caption Needed!"],
    },
    post_by:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    post:{
        type: String,
        default:"null.jpg"
    },
    likes:{
        type:Number,
        default:0
    }

},{
    timestamps:true
});

module.exports = mongoose.model("Post",postSchema);
