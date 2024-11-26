const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required!"],
            trim:true
        },
        email: {
            type: String,
            required: [true, "Email is required!"],
            lowercase: true, 
        },
        password: {
            type: String,
            required: [true, "Password is required!"],
        },
        
        profilePhoto:{
            type: String,
            default:"null.jpg"
        },
        followers:{
            type:Number,
            default:0
        },
        following:{
            type:Number,
            default:0
        }
    },
    {
        timestamps: true 
    }
);

module.exports = mongoose.model("User", userSchema);
