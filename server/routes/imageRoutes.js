const express = require('express')
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const Image = require("../model/Image");
const { v4: uuidv4 } = require('uuid');
const router = express.Router()
const multer = require('multer');
let path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {   
        cb(null, uuidv4() + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if(allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

let upload = multer({ storage, fileFilter });

router.route('/uploadOne').post(upload.single('photo'), (req, res) => {
    console.log(req.file)
    if(req.file ==null){
        return res.status(400).json({ error: "bad file token" });
    }
    const auth = req.headers.authorization
    const photo = req.file.filename;

    if(auth==null || photo ==null){
        return res.status(400).json({ error: "bad asuth token" });
    }
    const spl = auth.split(" ")
    if(spl.length<1){
        return res.status(400).json({ error: "bad auaasdth token" });
    }
    const token = spl[1]


    jwt.verify(token,"secret", (err,decoded) =>{
      if(err){
        console.log(err)
        return res
          .status(400)
          .json({ error: "Invallid/Expired Token"});
      }
      else{
        var user_id = decoded.id; 
        User.findById(user_id, function(err, user) {
          if(err){
            return res
            .status(400)
            .json({ error: err });
          }
          if(!user){
            return res
            .status(400)
            .json({ error: "User not found" });
          }
          else{
            console.log("User Found ") 
            const img = new Image({
                filename:photo,
                authorID:user_id
            })

            img.save()
                .then(i => res.json(i))
                .catch(err => res.status(400).json({ error: err }));
            return res.status(200).json({ good: "good" });           
          }
         
        });
      }
    })
});

router.route('/uploadMultiple').post(upload.array('photos'), (req, res) => {
    // console.log(req.file)
    if(req.files == null || req.files.length==0){
        return res.status(400).json({ error: "bad file token" });
    }
    const auth = req.headers.authorization
    const photos = req.files;

    if(auth==null){
        return res.status(400).json({ error: "bad asuth token" });
    }
    const spl = auth.split(" ")
    if(spl.length<1){
        return res.status(400).json({ error: "bad auaasdth token" });
    }
    const token = spl[1]


    jwt.verify(token,"secret", (err,decoded) =>{
      if(err){
        console.log(err)
        return res
          .status(400)
          .json({ error: "Invallid/Expired Token"});
      }
      else{
        var user_id = decoded.id; 
        User.findById(user_id, function(err, user) {
          if(err){
            return res
            .status(400)
            .json({ error: err });
          }
          if(!user){
            return res
            .status(400)
            .json({ error: "User not found" });
          }
          else{
            console.log("User Found ")
            photos.forEach(p => {
                const img = new Image({
                    filename:p.filename,
                    authorID:user_id
                })
                img.save().catch(err => res.status(400).json({ error: err }));
            });
            return res.status(200).json({ good: "good" });           
          }
         
        });
      }
    })
});

module.exports = router;