

const jwt = require('jsonwebtoken');
const CryptoJS = require("crypto-js");

const validateToken = async (req,res,next)=>{
    let token;
    let authHeader = req.headers.authorization;  
   
    if(authHeader && authHeader.startsWith("Bearer")){
        token = authHeader.split(" ")[1];

        let bytes = CryptoJS.AES.decrypt(token,process.env.CRYPTO_SECRET);
        const decodedToken = bytes.toString(CryptoJS.enc.Utf8);

        jwt.verify(decodedToken,process.env.JWT_SECRET,(err,decoded)=>{
            if(err){
                res.status(401).json({message:"Unauthorized user!"});
            }else{
                req.userId = decoded.userId;
                next();
            }
        });
    }else{
        return res.status(403).json({ message: "Token is required" });
    }
}
module.exports = {validateToken};


