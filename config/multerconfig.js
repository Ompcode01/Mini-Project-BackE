const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
//Steps --> 

//Disk Storage Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {  // This is setup for File
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12, function (err,name){
        const fn = name.toString("hex") + path.extname(file.originalname);
        cb(null, fn)
    })
    
  }
})

// Upload Variable create and export
const upload = multer({ storage: storage })

module.exports = upload;