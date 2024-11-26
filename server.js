const express = require('express');
const { dbConnect } = require('./config/dbConn');
const dotenv = require("dotenv").config();
const app = express();
const path = require("path");
const { log } = require('console');
dbConnect();
app.get("/",(req,res)=>{
    res.status(200).json({"message":"Home Page"})
});


app.use(express.json())

app.use("/user",require("./routes/index"));

const PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log(`App is live at http://localhost:${PORT}`);
})