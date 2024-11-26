const path = require("path");
const fs = require("fs");
const fileUnlink = (filePath)=>{
    imagePath = path.join(`${__dirname}`,`../`,`${filePath}`)
    fs.unlinkSync(imagePath);
}
module.exports = {fileUnlink}