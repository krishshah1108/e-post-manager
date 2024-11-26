const mongoose = require("mongoose");

const dbConnect = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected successfully to Database`);
    } catch (error) {
        console.log(error);
    }
}
module.exports = {dbConnect}